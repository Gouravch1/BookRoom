package com.bookroom.backend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReadingProgressResponse {
    private Long bookId;
    private Integer currentPage;
    private Integer totalPages;
    private Double progressPercent;
    private LocalDateTime lastReadAt;
}
