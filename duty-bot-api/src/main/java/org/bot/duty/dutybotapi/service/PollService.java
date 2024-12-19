package org.bot.duty.dutybotapi.service;

import lombok.AllArgsConstructor;
import org.bot.duty.dutybotapi.entity.Cadet;
import org.bot.duty.dutybotapi.entity.Poll;
import org.bot.duty.dutybotapi.repository.PollRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class PollService {

    private CadetService cadetService;

    private PollRepository pollRepository;

    public List<String> fromIdToLastname(List<String> ids) {
        return ids.stream()
                .map(cadetService::getCadetByChatId)
                .map(Cadet::getLastName)
                .toList();
    }

    public Poll update(String pollId, String votes) {
        Poll poll = pollRepository.findByUIDPOLL(pollId).orElse(null);
        if(poll==null) {
            return pollRepository.save(new Poll(pollId, votes, true));
        }
        else{
            poll.setVotes(votes);
            return pollRepository.save(poll);
        }
    }

    public Poll stop() {
        Poll poll = pollRepository.findByIsActive(true);
        if (poll != null) {
            poll.setIsActive(false);
        }
        return pollRepository.save(poll);
    }
}
