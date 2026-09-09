package com.bookroom.backend.service;

import com.bookroom.backend.dto.Request.HighlightRectangleRequest;
import com.bookroom.backend.dto.Request.HighlightRequest;
import com.bookroom.backend.dto.Response.HighlightRectangleResponse;
import com.bookroom.backend.dto.Response.HighlightResponse;
import com.bookroom.backend.entity.Book;
import com.bookroom.backend.entity.Highlight;
import com.bookroom.backend.entity.HighlightRectangle;
import com.bookroom.backend.entity.HighlightColor;
import com.bookroom.backend.entity.User;
import com.bookroom.backend.repository.BookRepository;
import com.bookroom.backend.repository.HighlightRepository;
import com.bookroom.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HighlightService {

    private final HighlightRepository highlightRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BookAccessService bookAccessService;

    public HighlightService(
            HighlightRepository highlightRepository,
            BookRepository bookRepository,
            UserRepository userRepository,
            BookAccessService bookAccessService
    ) {
        this.highlightRepository = highlightRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.bookAccessService = bookAccessService;
    }

    @Transactional
    public HighlightResponse create(
            HighlightRequest request,
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() ->
                        new RuntimeException("Book not found")
                );

        // User must have read access to this book.
        bookAccessService.requireReadAccess(
                book,
                email
        );

        Highlight highlight = new Highlight();

        highlight.setUser(user);
        highlight.setBook(book);
        highlight.setPageNumber(request.getPageNumber());
        highlight.setSelectedText(request.getSelectedText());
        highlight.setColor(request.getColor());
        highlight.setNote(request.getNote());

        if (request.getRectangles() != null) {
            for (HighlightRectangleRequest rectangleRequest :
                    request.getRectangles()) {

                HighlightRectangle rectangle =
                        new HighlightRectangle(
                                rectangleRequest.getX(),
                                rectangleRequest.getY(),
                                rectangleRequest.getWidth(),
                                rectangleRequest.getHeight()
                        );

                highlight.addRectangle(rectangle);
            }
        }

        Highlight saved =
                highlightRepository.save(highlight);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<HighlightResponse> getBookHighlights(
            Long bookId,
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() ->
                        new RuntimeException("Book not found")
                );

        bookAccessService.requireReadAccess(
                book,
                email
        );

        return highlightRepository
                .findByUserAndBookOrderByPageNumberAscCreatedAtAsc(
                        user,
                        book
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void delete(
            Long highlightId,
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Highlight highlight =
                highlightRepository
                        .findByIdAndUser(
                                highlightId,
                                user
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Highlight not found"
                                )
                        );

        highlightRepository.delete(highlight);
    }

    @Transactional
    public HighlightResponse updateColor(
            Long highlightId,
            HighlightColor color,
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Highlight highlight =
                highlightRepository
                        .findByIdAndUser(
                                highlightId,
                                user
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Highlight not found"
                                )
                        );

        highlight.setColor(color);

        return mapToResponse(
                highlightRepository.save(highlight)
        );
    }

    @Transactional
    public HighlightResponse updateNote(
            Long highlightId,
            String note,
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Highlight highlight =
                highlightRepository
                        .findByIdAndUser(
                                highlightId,
                                user
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Highlight not found"
                                )
                        );

        highlight.setNote(note);

        return mapToResponse(
                highlightRepository.save(highlight)
        );
    }

    private HighlightResponse mapToResponse(
            Highlight highlight
    ) {

        List<HighlightRectangleResponse> rectangles =
                highlight.getRectangles()
                        .stream()
                        .map(rectangle ->
                                new HighlightRectangleResponse(
                                        rectangle.getX(),
                                        rectangle.getY(),
                                        rectangle.getWidth(),
                                        rectangle.getHeight()
                                )
                        )
                        .toList();

        return new HighlightResponse(
                highlight.getId(),
                highlight.getBook().getId(),
                highlight.getPageNumber(),
                highlight.getSelectedText(),
                highlight.getColor(),
                highlight.getNote(),
                rectangles,
                highlight.getCreatedAt(),
                highlight.getUpdatedAt()
        );
    }
}