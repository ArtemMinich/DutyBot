package org.bot.duty.dutybotapi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Cadet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String secondName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String chatId;

    @Column(nullable = false)
    private Integer ebashkaCount;

    @Column(nullable = false)
    private boolean ebashkaStatus;
}
