package com.bookroom.backend.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "library_items" , uniqueConstraints = {@UniqueConstraint(name = "uk_library_user_book" , columnNames = {"user_id" , "book_id"}) })
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LibraryItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY , optional = false)
    @JoinColumn(name = "user_id" , nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY , optional = false)
    @JoinColumn(name = "book_id" , nullable = false)
    private Book book;

    @Column(nullable = false)
    private LocalDateTime addedAt;

    @PrePersist
    protected void onCreate(){
        addedAt = LocalDateTime.now();
    }

}
