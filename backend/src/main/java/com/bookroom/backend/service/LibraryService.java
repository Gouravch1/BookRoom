package com.bookroom.backend.service;

import com.bookroom.backend.common.BookNotFoundException;
import com.bookroom.backend.dto.Response.LibraryBookResponse;
import com.bookroom.backend.entity.Book;
import com.bookroom.backend.entity.LibraryItem;
import com.bookroom.backend.entity.ReadingProgress;
import com.bookroom.backend.entity.User;
import com.bookroom.backend.repository.BookRepository;
import com.bookroom.backend.repository.LibraryItemRepository;
import com.bookroom.backend.repository.ReadingProgressRepository;
import com.bookroom.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LibraryService {

   private final LibraryItemRepository libraryItemRepository;
   private final UserRepository userRepository;
   private final BookRepository bookRepository;
   private final ReadingProgressRepository readingProgressRepository;
   private final BookAccessService bookAccessService;

    public LibraryService(LibraryItemRepository libraryItemRepository, UserRepository userRepository, BookRepository bookRepository, ReadingProgressRepository readingProgressRepository, BookAccessService bookAccessService) {
        this.libraryItemRepository = libraryItemRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.readingProgressRepository = readingProgressRepository;
        this.bookAccessService = bookAccessService;
    }


    // Helper
    private LibraryBookResponse mapToResponse(
            LibraryItem item,
            ReadingProgress progress) {

        Book book = item.getBook();

        return LibraryBookResponse.builder()
                .libraryItemId(item.getId())
                .bookId(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .coverUrl(book.getCoverUrl())
                .totalPages(book.getTotalPages())
                .currentPage(
                        progress != null
                                ? progress.getCurrentPage()
                                : 1
                )
                .progressPercent(
                        progress != null
                                ? progress.getProgressPercent()
                                : 0.0
                )
                .lastReadAt(
                        progress != null
                                ? progress.getLastReadAt()
                                : null
                )
                .build();
    }


    // Add To Library
    public LibraryBookResponse addToLibrary(Long id , String email){

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Email not found!"));
        Book book = bookRepository.findById(id).orElseThrow(() -> new BookNotFoundException("Book Not Found ! "));

        bookAccessService.requireReadAccess(book, email);

        LibraryItem libraryItem = libraryItemRepository.findByUserAndBook(user , book)
                                                                        .orElseGet( () ->
                                                                                LibraryItem.builder()
                                                                                        .user(user)
                                                                                        .book(book)
                                                                                        .build()

                                                                        );
        LibraryItem saved = libraryItemRepository.save(libraryItem);
        return mapToResponse(saved , null);
    }


    // Get My Library
    public List<LibraryBookResponse> getMyLibrary(String email ){
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("user not found"));

        return libraryItemRepository.findByUser(user)
                .stream()
                .map(item -> {

                    ReadingProgress progress =
                            readingProgressRepository
                                    .findByUserAndBook(
                                            user,
                                            item.getBook()
                                    )
                                    .orElse(null);

                    return mapToResponse(item, progress);
                })
                .toList();
    }

    // Delete from library
    public void deleteFromLibrary(String email , Long bookId){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() ->
                        new BookNotFoundException("Book not found")
                );

        LibraryItem item = libraryItemRepository.findByUserAndBook(user , book).orElseThrow(() -> new RuntimeException ("This item is not available in your repository"));
        libraryItemRepository.delete(item);
    }

}
