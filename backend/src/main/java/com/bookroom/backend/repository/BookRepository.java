package com.bookroom.backend.repository;

import com.bookroom.backend.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book , Long> {
}
