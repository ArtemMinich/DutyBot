package org.bot.duty.dutybotapi.controllers;

import lombok.AllArgsConstructor;
import org.bot.duty.dutybotapi.dto.CadetsDto;
import org.bot.duty.dutybotapi.dto.command.CommandRequestDto;
import org.bot.duty.dutybotapi.dto.command.CommandResponseDto;
import org.bot.duty.dutybotapi.dto.light.LightRequestDto;
import org.bot.duty.dutybotapi.dto.light.LightResponseDto;
import org.bot.duty.dutybotapi.dto.poll.PollOptionRequestDto;
import org.bot.duty.dutybotapi.dto.poll.PollOptionResponseDto;
import org.bot.duty.dutybotapi.entity.Cadet;
import org.bot.duty.dutybotapi.entity.Light;
import org.bot.duty.dutybotapi.service.CadetService;
import org.bot.duty.dutybotapi.service.LightService;
import org.bot.duty.dutybotapi.service.PollService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@AllArgsConstructor
public class BotRestController {

    private CadetService cadetService;

    private PollService pollService;

    private LightService lightService;

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

    @PostMapping("/poll")
    public PollOptionResponseDto receivePollResults(@RequestBody PollOptionRequestDto pollResult) {
        return new PollOptionResponseDto(pollResult.option(),pollService.fromIdToLastname(pollResult.userIds()));
    }

    @GetMapping("/light")
    public LightResponseDto getLight() {
        Light light = lightService.getLastLight();
        if(light == null) return null;
        return new LightResponseDto(light.getLight(), light.getDate());
    }

    @PostMapping("/light")
    public LightResponseDto saveLight(@RequestBody LightRequestDto lightRequestDto) {
        Light light = lightService.save(lightRequestDto.light(), lightRequestDto.date());
        return new LightResponseDto(light.getLight(), light.getDate());
    }
}
