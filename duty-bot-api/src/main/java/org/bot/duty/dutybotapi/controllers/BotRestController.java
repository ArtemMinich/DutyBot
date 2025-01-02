package org.bot.duty.dutybotapi.controllers;

import lombok.AllArgsConstructor;
import org.bot.duty.dutybotapi.dto.CadetDto;
import org.bot.duty.dutybotapi.dto.CadetsDto;
import org.bot.duty.dutybotapi.dto.command.CommandRequestDto;
import org.bot.duty.dutybotapi.dto.command.CommandResponseDto;
import org.bot.duty.dutybotapi.dto.poll.PollOptionRequestDto;
import org.bot.duty.dutybotapi.dto.poll.PollOptionResponseDto;
import org.bot.duty.dutybotapi.dto.poll.update.PollUpdateRequestDto;
import org.bot.duty.dutybotapi.dto.poll.update.PollUpdateResponseDto;
import org.bot.duty.dutybotapi.entity.Cadet;
import org.bot.duty.dutybotapi.entity.Poll;
import org.bot.duty.dutybotapi.service.CadetService;
import org.bot.duty.dutybotapi.service.PollService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@AllArgsConstructor
public class BotRestController {

    private CadetService cadetService;

    private PollService pollService;

    @PostMapping("/command")
    public CommandResponseDto command(@RequestBody CommandRequestDto commandRequest) {
        String command = commandRequest.command();
        String args = commandRequest.args();
        return switch (command) {
            case "/giveebashka" -> {
                String content = cadetService.giveEbashkaCadets(args);
                yield new CommandResponseDto(content.isEmpty() ? "Немає людей" : content);
            }
            case "/allebashka" -> {
                String content = cadetService.getAllEbashkaCadets();
                yield new CommandResponseDto(content);
            }
            case "/addebashka" -> {
                String content = cadetService.addEbashka(args);
                yield new CommandResponseDto(content);
            }
            case "/removeebashka" -> {
                String content = cadetService.removeEbashka(args);
                yield new CommandResponseDto(content);
            }
            case "/freeebashka" -> {
                String content = cadetService.setFreeEbashka(args);
                yield new CommandResponseDto(content);
            }
            case "/setebashka" -> {
                String content = cadetService.setNotFreeEbashka(args);
                yield new CommandResponseDto(content);
            }
            default -> new CommandResponseDto("Що ти блять написало?");
        };
    }

    @GetMapping("/cadets")
    public CadetsDto getFreeCadets(@RequestParam(required = false) Boolean status) {
        List<Cadet> cadets = status==null?cadetService.getAllCadets():cadetService.getIdsCadetsByStatus(status);
        return new CadetsDto(cadets.size(),
                cadets.stream()
                        .map(c->c.getId().intValue()).toList(),
                cadets.stream()
                        .map(Cadet::getLastName).toList());
    }

    @GetMapping("/cadets/{chatId}")
    public CadetDto getFreeCadets(@PathVariable("chatId") String chatId) {
        Cadet cadet = cadetService.getCadetByChatId(chatId);
        if(cadet==null) return new CadetDto(0L,"НЕВІДОМИЙ","НЕВІДОМИЙ","НЕВІДОМИЙ","НЕВІДОМИЙ",0,false);
        return new CadetDto(cadet.getId(),cadet.getFirstName(),cadet.getSecondName(),cadet.getLastName(),cadet.getChatId(),cadet.getEbashkaCount(),cadet.isEbashkaStatus());
    }

    @PostMapping("/poll")
    public PollOptionResponseDto receivePollResults(@RequestBody PollOptionRequestDto pollResult) {
        return new PollOptionResponseDto(pollResult.option(),pollService.fromIdToLastname(pollResult.userIds()));
    }

    @PutMapping("/poll/update")
    public PollUpdateResponseDto updatePoll(@RequestBody PollUpdateRequestDto pollUpdateRequestDto){
        Poll poll = pollService.update(pollUpdateRequestDto.pollId(),pollUpdateRequestDto.votes());
        return new PollUpdateResponseDto(poll.getUIDPOLL(),poll.getVotes(),poll.getIsActive());
    }

    @GetMapping("/poll/stop")
    public PollUpdateResponseDto stopPoll() {
        Poll poll = pollService.stop();
        return new PollUpdateResponseDto(poll.getUIDPOLL(),poll.getVotes(),poll.getIsActive());
    }

    @GetMapping("/poll/active")
    public PollUpdateResponseDto activePoll() {
        Poll poll = pollService.getActive();
        if( poll != null ) {
            return new PollUpdateResponseDto(poll.getUIDPOLL(),poll.getVotes(),poll.getIsActive());
        }
        return new PollUpdateResponseDto(null,"{}",false);
    }

}
