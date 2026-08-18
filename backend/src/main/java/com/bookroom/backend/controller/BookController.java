package com.bookroom.backend.controller;

import com.bookroom.backend.dto.BookRequest;
import com.bookroom.backend.dto.BookResponse;
import com.bookroom.backend.service.BookService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {
    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }
    // create book for demo
    @PostMapping
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody BookRequest bookRequest , Authentication authentication){
        String email = authentication.getName();
        BookResponse response = bookService.createBook(email , bookRequest);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // get all books
    @GetMapping
    public ResponseEntity<List<BookResponse>> getAllBooks(){
        List<BookResponse> books = bookService.getAllBooks();
        return ResponseEntity.ok(books);
    }


    // upload book (in pdf format)
    @PostMapping(value = "/upload" , consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookResponse> uploadBook(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "author", required = false) String author,
            Authentication authentication)
    {
        String email = authentication.getName();

        BookResponse response = bookService.uploadBook(file, title, author, email);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get my books
    @GetMapping("/my-books")
    public ResponseEntity<List<BookResponse>> getMyBooks(Authentication authentication) {

        String email = authentication.getName();
        List<BookResponse> books = bookService.getMyBooks(email);

        return ResponseEntity.ok(books);
    }


    // Get book by id
    @GetMapping("/my-books/{id}")
    public ResponseEntity<BookResponse> getBookById(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        BookResponse response = bookService.getBookById(id, email);

        return ResponseEntity.ok(response);
    }

    // Delete book by id
    @DeleteMapping("/my-books/{id}")
    public ResponseEntity<Void> deleteBook(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        bookService.deleteBook(id, email);

        return ResponseEntity.noContent().build();
    }

    // update book by id
    @PutMapping("/my-books/{id}")
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


}
