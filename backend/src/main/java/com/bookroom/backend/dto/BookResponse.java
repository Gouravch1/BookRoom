package com.bookroom.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookResponse {

    private Long id;
    private String title;
    private String author;
    private String description;
    private String coverUrl;
    private String pdfUrl;
    private String isbn;
    private String language;
    private String source;
    private Integer totalPages;
}