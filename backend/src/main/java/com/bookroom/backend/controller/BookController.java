package com.bookroom.backend.controller;

import com.bookroom.backend.dto.BookRequest;
import com.bookroom.backend.dto.BookResponse;
import com.bookroom.backend.service.BookService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {
    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @PostMapping
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody BookRequest bookRequest , Authentication authentication){
        String email = authentication.getName();
        BookResponse response = bookService.createBook(email , bookRequest);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<BookResponse>> getAllBooks(){
        List<BookResponse> books = bookService.getAllBooks();
        return ResponseEntity.ok(books);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(
            @PathVariable Long id) {

        BookResponse book = bookService.getBookById(id);

        return ResponseEntity.ok(book);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookResponse> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        BookResponse response =
                bookService.updateBook(
                        id,
                        request,
                        email
                );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        bookService.deleteBook(id, email);

        return ResponseEntity.noContent().build();
    }

}
