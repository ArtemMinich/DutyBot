package org.bot.duty.dutybotapi.controllers;

import lombok.AllArgsConstructor;
import org.bot.duty.dutybotapi.dto.CommandRequest;
import org.bot.duty.dutybotapi.dto.CommandResponse;
import org.bot.duty.dutybotapi.service.CadetService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@AllArgsConstructor
public class BotRestController {

    private CadetService cadetService;

    @PostMapping("/command")
    public CommandResponse command(@RequestBody CommandRequest commandRequest) {
        String command = commandRequest.command();
        String args = commandRequest.args();
        return switch (command) {
            case "/giveebashka" -> {
                String content = cadetService.giveEbashkaCadets(args);
                yield new CommandResponse(content.isEmpty()?"Немає людей":content);
            }
                case "/allebashka" -> {
                String content = cadetService.getAllEbashkaCadets();
                yield new CommandResponse(content);
            }
            case "/addebashka" -> {
                String content = cadetService.addEbashka(args);
                yield new CommandResponse(content);
            }
            case "/removeebashka" -> {
                String content = cadetService.removeEbashka(args);
                yield new CommandResponse(content);
            }
            case "/freeebashka" -> {
                String content = cadetService.setFreeEbashka(args);
                yield new CommandResponse(content);
            }
            case "/setebashka" -> {
                String content = cadetService.setNotFreeEbashka(args);
                yield new CommandResponse(content);
            }
            default -> new CommandResponse("Що ти блять написало?");
        };
    }
}
