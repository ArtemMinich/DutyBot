package org.bot.duty.dutybotapi.controllers;

import lombok.AllArgsConstructor;
import org.bot.duty.dutybotapi.dto.CommandRequestDto;
import org.bot.duty.dutybotapi.dto.CommandResponseDto;
import org.bot.duty.dutybotapi.dto.FreeCadetsDto;
import org.bot.duty.dutybotapi.service.CadetService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@AllArgsConstructor
public class BotRestController {

    private CadetService cadetService;

    @PostMapping("/command")
    public CommandResponseDto command(@RequestBody CommandRequestDto commandRequest) {
        String command = commandRequest.command();
        String args = commandRequest.args();
        return switch (command) {
            case "/giveebashka" -> {
                String content = cadetService.giveEbashkaCadets(args);
                yield new CommandResponseDto(content.isEmpty()?"Немає людей":content);
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

    @GetMapping("/free-cadets")
    public FreeCadetsDto getFreeCadets() {
        return new FreeCadetsDto(cadetService.getNumFreeCadets(), cadetService.getIdsFreeCadets());
    }
}
