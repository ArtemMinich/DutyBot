package org.bot.duty.dutybotapi.dto;

import java.util.List;

public record CadetsDto(Integer size, List<Integer> ids, List<String> lastnames) {
}
