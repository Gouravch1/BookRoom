package com.bookroom.backend.service;

import com.bookroom.backend.common.BookAccessDeniedException;
import com.bookroom.backend.entity.Book;
import org.springframework.stereotype.Service;

@Service
public class BookAccessService {

    // Reading access
    public void requireReadAccess(Book book, String email) {

        if ("USER_UPLOAD".equals(book.getSource())) {

            if (book.getUploadedBy() == null ||
                    !book.getUploadedBy().getEmail().equals(email)) {

                throw new BookAccessDeniedException(
                        "You are not allowed to access this book"
                );
            }
        }
    }

    // Owner-only operations
    public void requireOwner(Book book, String email) {

        if (book.getUploadedBy() == null ||
                !book.getUploadedBy().getEmail().equals(email)) {

            throw new BookAccessDeniedException(
                    "You are not allowed to modify this book"
            );
        }
    }
}