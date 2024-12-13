package org.bot.duty.dutybotapi.controllers;

import lombok.AllArgsConstructor;
import org.bot.duty.dutybotapi.dto.CadetsDto;
import org.bot.duty.dutybotapi.dto.CommandRequestDto;
import org.bot.duty.dutybotapi.dto.CommandResponseDto;
import org.bot.duty.dutybotapi.entity.Cadet;
import org.bot.duty.dutybotapi.service.CadetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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

    @GetMapping("/cadets/{id}")
    public String getFreeCadets(@PathVariable("id") Long id) {
        return cadetService.getCadetById(id);
    }
}
