package org.bot.duty.dutybotapi.service;

import lombok.AllArgsConstructor;
import org.bot.duty.dutybotapi.dto.PollResults;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class PollService {

    private CadetService cadetService;

    public String formatResults(PollResults results) {
        StringBuilder response = new StringBuilder();
        response.append("Дозвольте:\n");
        results.get().forEach((option, ids) -> {
            response.append("   ").append(option).append("\n");
            ids.forEach(id -> response.append("      - ").append(cadetService.getCadetByChatId(id.toString())));
        });
        return response.toString();
    }
}
