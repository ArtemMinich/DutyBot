package org.bot.duty.dutybotapi.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Poll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String UIDPOLL;

    @Column(nullable = false)
    private String votes;

    @Column(nullable = false)
    private Boolean isActive;

    public Poll(String UIDPOLL, String votes, Boolean isActive) {
        this.UIDPOLL = UIDPOLL;
        this.votes = votes;
        this.isActive = isActive;
    }
}
