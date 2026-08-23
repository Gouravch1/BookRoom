package com.bookroom.backend.dto.Response;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReaderBookResponse {
    private Long bookId;
    private String title;
    private String author;
    private String pdfUrl;
    private Integer totalPages;
}
