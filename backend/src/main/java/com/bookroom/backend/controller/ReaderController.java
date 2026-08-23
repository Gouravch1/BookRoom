package com.bookroom.backend.controller;

import com.bookroom.backend.dto.Response.ReaderBookResponse;
import com.bookroom.backend.dto.Response.ReadingProgressResponse;
import com.bookroom.backend.entity.ReadingProgress;
import com.bookroom.backend.service.ReaderService;
import com.bookroom.backend.service.ReadingProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reader")
public class ReaderController {

    private ReadingProgressResponse mapToResponse(
            ReadingProgress progress) {

        return ReadingProgressResponse.builder()
                .bookId(progress.getBook().getId())
                .currentPage(progress.getCurrentPage())
                .totalPages(progress.getBook().getTotalPages())
                .progressPercent(progress.getProgressPercent())
                .lastReadAt(progress.getLastReadAt())
                .build();
    }

    private final ReadingProgressService readingProgressService;
    private final ReaderService readerService;

    public ReaderController(
            ReadingProgressService readingProgressService , ReaderService readerService) {

        this.readingProgressService = readingProgressService;
        this.readerService = readerService;
    }

    @PatchMapping("/{bookId}/progress")
    public ResponseEntity<ReadingProgressResponse> updateProgress(
            @PathVariable Long bookId,
            @RequestParam Integer currentPage,
            Authentication authentication) {

        ReadingProgressResponse progress =
                readingProgressService.updateProgress(
                        bookId,
                        currentPage,
                        authentication.getName()
                );

        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{bookId}/progress")
    public ResponseEntity<ReadingProgressResponse> getProgress(
            @PathVariable Long bookId,
            Authentication authentication
    ){
        ReadingProgressResponse progress = readingProgressService.getProgress(bookId , authentication.getName());
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{bookId}/read")
    public ResponseEntity<ReaderBookResponse> getBookForReading(@PathVariable Long bookId , Authentication authentication){
        ReaderBookResponse response = readerService.getBookForReading(bookId , authentication.getName());
        return ResponseEntity.ok(response);
    }
}