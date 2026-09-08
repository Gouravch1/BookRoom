package com.bookroom.backend.dto.Request;

import com.bookroom.backend.entity.HighlightColor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class HighlightRequest {

    private Long bookId;

    private Integer pageNumber;

    private String selectedText;

    private HighlightColor color;

    private List<HighlightRectangleRequest> rectangles;
}