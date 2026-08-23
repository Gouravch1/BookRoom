package com.bookroom.backend.dto.Response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class LibraryBookResponse {

    private Long libraryItemId;
    private Long bookId;
    private String title;
    private String author;
    private String coverUrl;
    private Integer totalPages;

    private Integer currentPage;
    private Double progressPercent;
    private LocalDateTime lastReadAt;
}