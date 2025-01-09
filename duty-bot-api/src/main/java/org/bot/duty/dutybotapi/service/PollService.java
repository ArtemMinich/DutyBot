package org.bot.duty.dutybotapi.service;

import lombok.AllArgsConstructor;
import org.bot.duty.dutybotapi.dto.poll.PollDto;
import org.bot.duty.dutybotapi.entity.Poll;
import org.bot.duty.dutybotapi.repository.PollRepository;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class PollService {

    private final PollRepository pollRepository;

    public Poll get() {
        return pollRepository.findFirstByOrderByIdAsc();
    }

    public Poll update(PollDto pollDto) {
        Poll poll = pollRepository.findByPollId(pollDto.pollId());
        poll.setVotes(pollDto.votes());
        return pollRepository.save(poll);
    }

    public Poll start(PollDto pollDto) {
        Poll poll = new Poll();
        poll.setPollId(pollDto.pollId());
        poll.setVotes(pollDto.votes());
        return pollRepository.save(poll);
    }

    public void stop() {
        Poll poll = get();
        pollRepository.delete(poll);
    }
}
