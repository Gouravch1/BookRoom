package com.bookroom.backend.controller;

import com.bookroom.backend.dto.AuthResponse;
import com.bookroom.backend.dto.LoginRequest;
import com.bookroom.backend.dto.RegisterRequest;
import com.bookroom.backend.dto.UserResponse;
import com.bookroom.backend.entity.User;
import com.bookroom.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }

    // Register / Sign Up
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request){
            UserResponse response = authService.register(request);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);
    }

    //Login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity
                .ok(response);
    }
}
