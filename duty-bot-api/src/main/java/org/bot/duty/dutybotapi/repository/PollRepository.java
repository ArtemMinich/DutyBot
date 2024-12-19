package org.bot.duty.dutybotapi.repository;

import org.bot.duty.dutybotapi.entity.Poll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PollRepository extends JpaRepository<Poll, Long> {
    Poll findByIsActive(Boolean isActive);

    Optional<Poll> findByUIDPOLL(String uidpoll);
}
