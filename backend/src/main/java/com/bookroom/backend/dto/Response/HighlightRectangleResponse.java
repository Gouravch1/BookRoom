package com.bookroom.backend.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class HighlightRectangleResponse {

    private Double x;

    private Double y;

    private Double width;

    private Double height;
}