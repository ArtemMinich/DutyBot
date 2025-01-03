package org.bot.duty.dutybotapi.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO for {@link org.bot.duty.dutybotapi.entity.Cadet}
 */
public record CadetDto(
        Long id,
        String firstName,
        String secondName,
        String lastName,
        String chatId,
        Integer ebashkaCount,
        boolean ebashkaStatus
) implements Serializable { }