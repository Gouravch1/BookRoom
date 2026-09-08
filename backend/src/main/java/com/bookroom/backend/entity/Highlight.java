package com.bookroom.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "highlights",
        indexes = {
                @Index(
                        name = "idx_highlight_user_book",
                        columnList = "user_id, book_id"
                ),
                @Index(
                        name = "idx_highlight_user_book_page",
                        columnList = "user_id, book_id, page_number"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Highlight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_highlight_user"
            )
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "book_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_highlight_book"
            )
    )
    private Book book;

    @Column(name = "page_number", nullable = false)
    private Integer pageNumber;

    @Column(name = "selected_text", columnDefinition = "TEXT")
    private String selectedText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HighlightColor color;

    @OneToMany(
            mappedBy = "highlight",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<HighlightRectangle> rectangles =
            new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addRectangle(HighlightRectangle rectangle) {
        rectangles.add(rectangle);
        rectangle.setHighlight(this);
    }
}