package com.bookroom.backend.repository;

import com.bookroom.backend.entity.Book;
import com.bookroom.backend.entity.ReadingProgress;
import com.bookroom.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReadingProgressRepository extends JpaRepository<ReadingProgress, Long> {
    Optional<ReadingProgress> findByUserAndBook(User user , Book book);
}
