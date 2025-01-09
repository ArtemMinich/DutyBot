package org.bot.duty.dutybotapi.controllers;

import lombok.AllArgsConstructor;
import org.bot.duty.dutybotapi.dto.poll.PollDto;
import org.bot.duty.dutybotapi.entity.Poll;
import org.bot.duty.dutybotapi.service.PollService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/poll")
@AllArgsConstructor
public class PollController {

    private final PollService pollService;

    @GetMapping()
    @ResponseStatus(value = HttpStatus.OK)
    public PollDto getActivePoll(){
        Poll poll = pollService.get();
        if (poll == null) return null;
        return new PollDto(poll.getPollId(), poll.getVotes());
    }

    @PatchMapping()
    @ResponseStatus(value = HttpStatus.OK)
    public PollDto updateActivePoll(@RequestBody PollDto pollDto){
        Poll poll = pollService.update(pollDto);
        return new PollDto(poll.getPollId(), poll.getVotes());
    }

    @PostMapping()
    @ResponseStatus(value = HttpStatus.CREATED)
    public PollDto createPoll(@RequestBody PollDto pollDto){
        Poll poll = pollService.start(pollDto);
        return new PollDto(poll.getPollId(), poll.getVotes());
    }

    @DeleteMapping()
    @ResponseStatus(value = HttpStatus.NO_CONTENT)
    public void deletePoll(){
        pollService.stop();
    }
}
