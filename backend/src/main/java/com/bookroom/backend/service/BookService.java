package com.bookroom.backend.service;


import com.bookroom.backend.common.BookAccessDeniedException;
import com.bookroom.backend.common.BookNotFoundException;
import com.bookroom.backend.dto.BookRequest;
import com.bookroom.backend.dto.BookResponse;
import com.bookroom.backend.entity.Book;
import com.bookroom.backend.entity.User;
import com.bookroom.backend.repository.BookRepository;
import com.bookroom.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public BookService(BookRepository bookRepository, UserRepository userRepository) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    // Create Book
    public BookResponse createBook(String email , BookRequest request){
        User user = userRepository.findByEmail(email).orElseThrow( ()-> new RuntimeException("user not found"));
        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .description(request.getDescription())
                .coverUrl(request.getCoverUrl())
                .pdfUrl(request.getPdfUrl())
                .isbn(request.getIsbn())
                .language(request.getLanguage())
                .source(request.getSource())
                .uploadedBy(user)
                .build();
        Book savedBook = bookRepository.save(book);

        return BookResponse.builder()
                .id(savedBook.getId())
                .title(savedBook.getTitle())
                .author(savedBook.getAuthor())
                .description(savedBook.getDescription())
                .coverUrl(savedBook.getCoverUrl())
                .pdfUrl(savedBook.getPdfUrl())
                .isbn(savedBook.getIsbn())
                .language(savedBook.getLanguage())
                .source(savedBook.getSource())
                .build();
    }

    // Get All Books
    public List<BookResponse> getAllBooks() {

        return bookRepository.findAll()
                .stream()
                .map(book -> BookResponse.builder()
                        .id(book.getId())
                        .title(book.getTitle())
                        .author(book.getAuthor())
                        .description(book.getDescription())
                        .coverUrl(book.getCoverUrl())
                        .pdfUrl(book.getPdfUrl())
                        .isbn(book.getIsbn())
                        .language(book.getLanguage())
                        .source(book.getSource())
                        .build())
                .toList();
    }

    //Get book by id
    public BookResponse getBookById(Long id) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Book not found")
                );

        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .description(book.getDescription())
                .coverUrl(book.getCoverUrl())
                .pdfUrl(book.getPdfUrl())
                .isbn(book.getIsbn())
                .language(book.getLanguage())
                .source(book.getSource())
                .build();
    }

    // Update book
    public BookResponse updateBook(
            Long bookId,
            BookRequest request,
            String email) {

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() ->
                        new BookNotFoundException(
                                "Book not found"
                        )
                );

        if (!book.getUploadedBy().getEmail().equals(email)) {
            throw new BookAccessDeniedException(
                    "You are not allowed to modify this book"
            );
        }

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setDescription(request.getDescription());
        book.setCoverUrl(request.getCoverUrl());
        book.setPdfUrl(request.getPdfUrl());
        book.setIsbn(request.getIsbn());
        book.setLanguage(request.getLanguage());
        book.setSource(request.getSource());

        Book updatedBook = bookRepository.save(book);

        return BookResponse.builder()
                .id(updatedBook.getId())
                .title(updatedBook.getTitle())
                .author(updatedBook.getAuthor())
                .description(updatedBook.getDescription())
                .coverUrl(updatedBook.getCoverUrl())
                .pdfUrl(updatedBook.getPdfUrl())
                .isbn(updatedBook.getIsbn())
                .language(updatedBook.getLanguage())
                .source(updatedBook.getSource())
                .build();
    }

    // Delete Book
    public void deleteBook(
            Long bookId,
            String email) {

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() ->
                        new BookNotFoundException(
                                "Book not found"
                        )
                );

        if (!book.getUploadedBy().getEmail().equals(email)) {
            throw new BookAccessDeniedException(
                    "You are not allowed to delete this book"
            );
        }

        bookRepository.delete(book);
    }
}
