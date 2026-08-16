package com.bookroom.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String author;

    private String description;

    private String coverUrl;

    private String pdfUrl;

    private String isbn;

    private String language;

    private String source;
}