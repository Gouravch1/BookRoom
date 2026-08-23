package com.bookroom.backend.service;

import com.bookroom.backend.common.BookNotFoundException;
import com.bookroom.backend.dto.Response.ReaderBookResponse;
import com.bookroom.backend.entity.Book;
import com.bookroom.backend.repository.BookRepository;
import org.springframework.stereotype.Service;

@Service
public class ReaderService {

    private final BookRepository bookRepository;
    private final FileStorageService fileStorageService;
    private final BookAccessService bookAccessService;

    public ReaderService(
            BookRepository bookRepository,
            FileStorageService fileStorageService,
            BookAccessService bookAccessService) {

        this.bookRepository = bookRepository;
        this.fileStorageService = fileStorageService;
        this.bookAccessService = bookAccessService;
    }

    public ReaderBookResponse getBookForReading(
            Long bookId,
            String email) {

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() ->
                        new BookNotFoundException("Book not found!")
                );

        // Centralized access check
        bookAccessService.requireReadAccess(book, email);

        String signedUrl =
                fileStorageService.generateAccessUrl(
                        book.getStoragePublicId(),
                        book.getStorageVersion()
                );

        return ReaderBookResponse.builder()
                .bookId(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .pdfUrl(signedUrl)
                .totalPages(book.getTotalPages())
                .build();
    }
}