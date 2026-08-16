package com.bookroom.backend.controller;

import com.bookroom.backend.dto.UserResponse;
import com.bookroom.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication){
        String email = authentication.getName();
        UserResponse userResponse = userService.getCurrentUser(email);
        return ResponseEntity.ok(userResponse);
    }
}
