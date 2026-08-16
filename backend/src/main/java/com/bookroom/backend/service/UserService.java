package com.bookroom.backend.service;

import com.bookroom.backend.dto.UserResponse;
import com.bookroom.backend.entity.User;
import com.bookroom.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public UserResponse getCurrentUser(String email){
        User user = userRepository.findByEmail(email).orElseThrow(() ->
                                                        new RuntimeException("user not found")
                );
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}
