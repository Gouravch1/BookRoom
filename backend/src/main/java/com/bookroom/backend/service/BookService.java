package com.bookroom.backend.service;


import java.io.IOException;
import java.util.List;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.bookroom.backend.common.BookAccessDeniedException;
import com.bookroom.backend.common.BookNotFoundException;
import com.bookroom.backend.dto.BookRequest;
import com.bookroom.backend.dto.BookResponse;
import com.bookroom.backend.entity.Book;
import com.bookroom.backend.entity.User;
import com.bookroom.backend.repository.BookRepository;
import com.bookroom.backend.repository.UserRepository;

@Service
public class BookService {
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public BookService(BookRepository bookRepository, UserRepository userRepository, FileStorageService fileStorageService) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    private BookResponse mapToResponse(Book book) {
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
                .currentPage(book.getCurrentPage())
                .totalPages(book.getTotalPages())
                .progressPercent(book.getProgressPercent())
                .build();
    }

    // Create Book
    public BookResponse createBook(String email, BookRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("user not found"));
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

    // Upload book
    public BookResponse uploadBook(MultipartFile file, String title, String author, String email) {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (!"application/pdf".equals(file.getContentType())) {
            throw new RuntimeException("Only PDF files are allowed");
        }

        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int totalPages;
        try {
            PDDocument document = Loader.loadPDF(file.getBytes());
            totalPages = document.getNumberOfPages();
            document.close();
        } catch (IOException e) {
            throw new RuntimeException("Could not read PDF: " + e.getMessage());
        }

        String pdfUrl = fileStorageService.upload(file);

        Book book = Book.builder()
                .title(title)
                .author(author)
                .pdfUrl(pdfUrl)
                .source("USER_UPLOAD")
                .totalPages(totalPages)
                .uploadedBy(user)
                .build();

        Book saved = bookRepository.save(book);

        return mapToResponse(saved);
    }

    // Get my books
    public List<BookResponse> getMyBooks(String email){
         User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("user not found"));
         List<Book> books = bookRepository.findByUploadedBy(user);
        return books.stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get book by id (Authenticated)
    public BookResponse getBookById(Long id , String email){
        Book book = bookRepository.findById(id).orElseThrow(() -> new BookNotFoundException("Book not found"));
        if(!book.getUploadedBy().getEmail().equals(email)) throw new RuntimeException("You are not allowed to access this book");
        return mapToResponse(book);

    }

    // Delete book by id (Authenticated)
    public void deleteBookById(Long id , String email){
        Book book = bookRepository.findById(id).orElseThrow(() -> new BookNotFoundException("Book not found"));
        if(!book.getUploadedBy().getEmail().equals(email)) throw new RuntimeException("You are not allowed to access this book");
        fileStorageService.delete(book.getPdfUrl());
        bookRepository.delete(book);
    }

    // Update book (Authenticated)
    public BookResponse updateBook(Long bookId, BookRequest request, String email) {

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Book not found"));

        if (!book.getUploadedBy().getEmail().equals(email)) {
            throw new BookAccessDeniedException("You are not allowed to modify this book");
        }

        if (request.getTitle() != null && !request.getTitle().isEmpty()) {
            book.setTitle(request.getTitle());
        }

        if (request.getAuthor() != null && !request.getAuthor().isEmpty()) {
            book.setAuthor(request.getAuthor());
        }

        if (request.getDescription() != null && !request.getDescription().isEmpty()) {
            book.setDescription(request.getDescription());
        }

        if (request.getCoverUrl() != null && !request.getCoverUrl().isEmpty()) {
            book.setCoverUrl(request.getCoverUrl());
        }

        if (request.getPdfUrl() != null && !request.getPdfUrl().isEmpty()) {
            book.setPdfUrl(request.getPdfUrl());
        }

        if (request.getIsbn() != null && !request.getIsbn().isEmpty()) {
            book.setIsbn(request.getIsbn());
        }

        if (request.getLanguage() != null && !request.getLanguage().isEmpty()) {
            book.setLanguage(request.getLanguage());
        }

        if (request.getSource() != null && !request.getSource().isEmpty()) {
            book.setSource(request.getSource());
        }

        Book updatedBook = bookRepository.save(book);

        return mapToResponse(updatedBook);
    }


    // Update progress
    public BookResponse updateProgress(Long id, Integer currentPage, String email) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (!book.getUploadedBy().getEmail().equals(email)) {
            throw new RuntimeException("Not allowed");
        }

        if (currentPage > book.getTotalPages() || currentPage < 0) {
            throw new RuntimeException("Invalid page number");
        }

        book.setCurrentPage(currentPage);
        book.setProgressPercent((currentPage * 100.0) / book.getTotalPages());

        Book saved = bookRepository.save(book);
        return mapToResponse(saved);
    }


}
