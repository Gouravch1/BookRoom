package com.bookroom.backend.dto.Request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class HighlightRectangleRequest {

    private Double x;

    private Double y;

    private Double width;

    private Double height;
}