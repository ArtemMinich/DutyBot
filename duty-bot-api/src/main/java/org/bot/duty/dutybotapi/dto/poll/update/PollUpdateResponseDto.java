package org.bot.duty.dutybotapi.dto.poll.update;

public record PollUpdateResponseDto(String pollId, String votes, Boolean isActive) {
}
