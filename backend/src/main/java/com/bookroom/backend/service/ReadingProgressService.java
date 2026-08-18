package com.bookroom.backend.service;

import com.bookroom.backend.common.BookAccessDeniedException;
import com.bookroom.backend.common.BookNotFoundException;
import com.bookroom.backend.dto.ReadingProgressResponse;
import com.bookroom.backend.entity.Book;
import com.bookroom.backend.entity.ReadingProgress;
import com.bookroom.backend.entity.User;
import com.bookroom.backend.repository.BookRepository;
import com.bookroom.backend.repository.ReadingProgressRepository;
import com.bookroom.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class ReadingProgressService {

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


    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final ReadingProgressRepository readingProgressRepository;


    public ReadingProgressService(UserRepository userRepository, BookRepository bookRepository, ReadingProgressRepository readingProgressRepository) {
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.readingProgressRepository = readingProgressRepository;
    }



    // update reading progress
    public ReadingProgressResponse updateProgress(Long bookId , Integer currentPage , String email){
        User user = userRepository.findByEmail(email).orElseThrow(
                                    () -> new RuntimeException("user not found"));

        Book book = bookRepository.findById(bookId).orElseThrow(
                ()-> new BookNotFoundException("book not found")
        );

        if (!book.getUploadedBy().getEmail().equals(email)) {
            throw new BookAccessDeniedException(
                    "You are not allowed to access this book"
            );
        }

        if (book.getTotalPages() == null || book.getTotalPages() <= 0) {
            throw new IllegalStateException(
                    "Book page count is not available"
            );
        }

        ReadingProgress progress = readingProgressRepository.findByUserAndBook(user , book)
                .orElseGet( () ->
                         ReadingProgress.builder()
                        .user(user)
                        .book(book)
                        .currentPage(1)
                        .progressPercent(0.0)
                        .build()
                );

        if (currentPage < 1 || currentPage > book.getTotalPages()) {
            throw new IllegalArgumentException(
                    "Invalid page number"
            );
        }

        double progressPercent =
                (currentPage * 100.0)
                        / book.getTotalPages();

        progress.setCurrentPage(currentPage);
        progress.setProgressPercent(progressPercent);

        ReadingProgress savedProgress =
                readingProgressRepository.save(progress);

        return mapToResponse(savedProgress);
    }

    // Get Reading progress

    public ReadingProgressResponse getProgress(Long bookId , String email)
    {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("user not found"));

        Book book = bookRepository.findById(bookId).orElseThrow(
                ()-> new BookNotFoundException("book not found")
        );

        if (!book.getUploadedBy().getEmail().equals(email)) {
            throw new BookAccessDeniedException(
                    "You are not allowed to access this book"
            );
        }

        if (book.getTotalPages() == null || book.getTotalPages() <= 0) {
            throw new IllegalStateException(
                    "Book page count is not available"
            );
        }

        ReadingProgress progress = readingProgressRepository.findByUserAndBook(user , book)
                .orElseGet( () ->
                        ReadingProgress.builder()
                                .user(user)
                                .book(book)
                                .currentPage(1)
                                .progressPercent(0.0)
                                .build()
                );

        return mapToResponse(progress);
    }


}
