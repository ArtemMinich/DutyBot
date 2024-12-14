package org.bot.duty.dutybotapi.dto.poll;

import java.util.List;

public record PollOptionRequestDto (String option, List<String> userIds) {
}
