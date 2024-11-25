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
            case "/start" -> new CommandResponse("фініш блять");
            case "/give-ebashka" -> {
                String content = cadetService.giveEbashkaCadets(args);
                yield new CommandResponse(content.isEmpty()?"Немає людей":content);
            }
            case "/all-ebashka" -> {
                String content = cadetService.getAllEbashkaCadets();
                yield new CommandResponse(content);
            }
            case "/stop" -> new CommandResponse("ok");
            default -> null;
        };
    }
}
