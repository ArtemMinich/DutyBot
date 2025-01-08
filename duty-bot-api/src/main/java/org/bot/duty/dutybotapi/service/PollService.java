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

    public Poll getActive() {
        Poll poll = pollRepository.findFirstByIsActive(true);
        if(poll == null) return start(new PollDto("",""));
        return poll;
    }

    public Poll updateActive(PollDto pollDto) {
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
        Poll poll = getActive();
        pollRepository.delete(poll);
    }
}
