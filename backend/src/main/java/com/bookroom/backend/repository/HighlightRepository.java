package com.bookroom.backend.repository;

import com.bookroom.backend.entity.Book;
import com.bookroom.backend.entity.Highlight;
import com.bookroom.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HighlightRepository
        extends JpaRepository<Highlight, Long> {

    List<Highlight> findByUserAndBookOrderByPageNumberAscCreatedAtAsc(
            User user,
            Book book
    );

    Optional<Highlight> findByIdAndUser(
            Long id,
            User user
    );
}