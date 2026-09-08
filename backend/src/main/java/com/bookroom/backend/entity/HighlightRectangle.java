package com.bookroom.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "highlight_rectangles",
        indexes = {
                @Index(
                        name = "idx_highlight_rectangle_highlight",
                        columnList = "highlight_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class HighlightRectangle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "highlight_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_rectangle_highlight"
            )
    )
    private Highlight highlight;

    @Column(nullable = false)
    private Double x;

    @Column(nullable = false)
    private Double y;

    @Column(nullable = false)
    private Double width;

    @Column(nullable = false)
    private Double height;

    public HighlightRectangle(
            Double x,
            Double y,
            Double width,
            Double height
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}