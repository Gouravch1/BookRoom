package com.bookroom.backend.controller;

import com.bookroom.backend.dto.Response.LibraryBookResponse;
import com.bookroom.backend.service.LibraryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
public class LibraryController {
    private final LibraryService libraryService;
    public LibraryController(LibraryService libraryService){
        this.libraryService = libraryService;
    }

    // ADD TO LIBRARY
    @PostMapping("/{bookId}")
    public ResponseEntity<LibraryBookResponse> addToLibrary(@PathVariable Long bookId,
                                                            Authentication authentication
                                                            ){
        LibraryBookResponse response = libraryService.addToLibrary(bookId , authentication.getName());
        return ResponseEntity.ok(response);
    }

    // GET FROM LIBRARY
    @GetMapping
    public ResponseEntity<List<LibraryBookResponse>> getFromLibrary(Authentication authentication){
        List<LibraryBookResponse> library = libraryService.getMyLibrary(authentication.getName());
        return ResponseEntity.ok(library);
    }

    // DELETE FROM LIBRARY
    @DeleteMapping("/{bookId}")
    public ResponseEntity<Void> deleteFromLibrary(@PathVariable Long bookId , Authentication authentication){
        libraryService.deleteFromLibrary(authentication.getName(), bookId);
        return ResponseEntity.noContent().build();
    }
}
