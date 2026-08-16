package com.bookroom.backend.common;

import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String , String>> handleEmailAlreadyExist(EmailAlreadyExistsException exception){
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "error", exception.getMessage()
                ));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String , String>> handleInvalidCredentials(InvalidCredentialsException exception){
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("error" , exception.getMessage()));
    }

    @ExceptionHandler(BookNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleBookNotFound(
            BookNotFoundException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "message",
                        ex.getMessage()
                ));
    }

    @ExceptionHandler(BookAccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleBookAccessDenied(
            BookAccessDeniedException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "message",
                        ex.getMessage()
                ));
    }
}
