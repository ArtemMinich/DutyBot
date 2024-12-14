package org.bot.duty.dutybotapi.service;

import lombok.AllArgsConstructor;
import org.bot.duty.dutybotapi.entity.Cadet;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class PollService {

    private CadetService cadetService;

    public List<String> fromIdToLastname(List<String> ids) {
        return ids.stream()
                .map(cadetService::getCadetByChatId)
                .map(Cadet::getLastName)
                .toList();
    }
}
