package com.bookroom.backend.repository;

import com.bookroom.backend.entity.Book;
import com.bookroom.backend.entity.LibraryItem;
import com.bookroom.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LibraryItemRepository extends JpaRepository<LibraryItem , Long> {

    Optional<LibraryItem> findByUserAndBook(User user , Book book);
    List<LibraryItem> findByUser(User user);

}
