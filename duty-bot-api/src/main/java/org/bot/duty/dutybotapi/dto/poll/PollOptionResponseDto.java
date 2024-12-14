package org.bot.duty.dutybotapi.dto.poll;

import java.util.List;

public record PollOptionResponseDto(String option, List<String> lastNames) {
}
