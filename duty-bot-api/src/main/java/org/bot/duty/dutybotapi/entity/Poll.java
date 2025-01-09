package org.bot.duty.dutybotapi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Poll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @Column(nullable = false, unique = true, name = "poll_id")
    private String pollId;

    @Column(nullable = true, name = "votes")
    private String votes;

}
