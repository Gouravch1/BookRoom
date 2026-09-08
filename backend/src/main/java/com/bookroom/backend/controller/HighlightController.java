package com.bookroom.backend.controller;

import com.bookroom.backend.dto.Request.HighlightRequest;
import com.bookroom.backend.dto.Response.HighlightResponse;
import com.bookroom.backend.entity.HighlightColor;
import com.bookroom.backend.service.HighlightService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/highlights")
public class HighlightController {

    private final HighlightService highlightService;

    public HighlightController(
            HighlightService highlightService
    ) {
        this.highlightService = highlightService;
    }

    @PostMapping
    public ResponseEntity<HighlightResponse> create(
            @RequestBody HighlightRequest request,
            Authentication authentication
    ) {

        HighlightResponse response =
                highlightService.create(
                        request,
                        authentication.getName()
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<HighlightResponse>> getBookHighlights(
            @PathVariable Long bookId,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                highlightService.getBookHighlights(
                        bookId,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{highlightId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long highlightId,
            Authentication authentication
    ) {

        highlightService.delete(
                highlightId,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{highlightId}/color")
    public ResponseEntity<HighlightResponse> updateColor(
            @PathVariable Long highlightId,
            @RequestParam HighlightColor color,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                highlightService.updateColor(
                        highlightId,
                        color,
                        authentication.getName()
                )
        );
    }
}