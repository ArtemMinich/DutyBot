package org.bot.duty.dutybotapi.repository;

import org.bot.duty.dutybotapi.entity.Poll;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PollRepository extends JpaRepository<Poll, Long> {

    Poll findByPollId(String s);

    Poll findFirstByOrderByIdAsc();
}