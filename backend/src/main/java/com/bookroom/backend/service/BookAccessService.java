package com.bookroom.backend.service;

import com.bookroom.backend.common.BookAccessDeniedException;
import com.bookroom.backend.entity.Book;
import com.bookroom.backend.entity.BookUploadSource;
import org.springframework.stereotype.Service;

@Service
public class BookAccessService {

    // Reading access
    public void requireReadAccess(Book book, String email) {

        // Admin uploaded books can be read by any authenticated user
        if (book.getSource() == BookUploadSource.ADMIN_UPLOAD) {
            return;
        }

        // User uploaded books can only be read by the uploader
        if (book.getSource() == BookUploadSource.USER_UPLOAD) {

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