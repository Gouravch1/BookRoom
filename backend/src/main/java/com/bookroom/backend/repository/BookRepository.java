package com.bookroom.backend.repository;

import com.bookroom.backend.entity.Book;
import com.bookroom.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book , Long> {
    List<Book> findByUploadedBy(User user);
}
