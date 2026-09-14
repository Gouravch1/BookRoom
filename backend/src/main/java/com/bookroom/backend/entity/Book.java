package com.bookroom.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.bookroom.backend.entity.BookUploadSource;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String author;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String coverUrl;

    private String pdfUrl;

    private String storagePublicId;

    private Integer storageVersion;

    private String isbn;

    private String language;
    
    @Enumerated(EnumType.STRING)
    private BookUploadSource source;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(nullable = true)
    private Integer totalPages;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LibraryItem> libraryItems = new ArrayList<>();

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReadingProgress> readingProgresses = new ArrayList<>();

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Highlight> highlights = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}