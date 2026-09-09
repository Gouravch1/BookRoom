package com.bookroom.backend.dto.Response;

import com.bookroom.backend.entity.HighlightColor;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class HighlightResponse {

    private Long id;

    private Long bookId;

    private Integer pageNumber;

    private String selectedText;

    private HighlightColor color;

    private String note;

    private List<HighlightRectangleResponse> rectangles;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}