package com.bookroom.backend.dto.Request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PageAiRequest {

    private Long bookId;

    private Integer pageNumber;
}