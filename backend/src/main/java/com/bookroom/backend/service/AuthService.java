package com.bookroom.backend.service;

import com.bookroom.backend.common.EmailAlreadyExistsException;
import com.bookroom.backend.common.InvalidCredentialsException;
import com.bookroom.backend.dto.AuthResponse;
import com.bookroom.backend.dto.LoginRequest;
import com.bookroom.backend.dto.RegisterRequest;
import com.bookroom.backend.dto.UserResponse;
import com.bookroom.backend.entity.User;
import com.bookroom.backend.repository.UserRepository;
import com.bookroom.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository , PasswordEncoder passwordEncoder , JwtService jwtService){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    // Registration
    public UserResponse register(RegisterRequest request){
        // Email already Exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(
                    "Email already registered"
            );
        }
        // Encoding password to Bcrypt
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(encodedPassword)
                .build();
       User savedUser =  userRepository.save(user);
        return UserResponse.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .build();
    }

    //Login
    public AuthResponse login(LoginRequest loginRequest){
        User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow(() -> new InvalidCredentialsException("Invalid Email or Password"));
        boolean passwordMatches = passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword()

        );
        if (!passwordMatches) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        String token = jwtService.generateToken(user.getEmail());
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .build();

    }
}
