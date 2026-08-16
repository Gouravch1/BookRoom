package com.bookroom.backend.common;

public class BookAccessDeniedException extends RuntimeException {

    public BookAccessDeniedException(String message) {
        super(message);
    }
}