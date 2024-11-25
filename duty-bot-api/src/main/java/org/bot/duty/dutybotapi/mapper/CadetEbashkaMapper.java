package org.bot.duty.dutybotapi.mapper;

import org.bot.duty.dutybotapi.entity.Cadet;
import org.springframework.stereotype.Service;

@Service
public class CadetEbashkaMapper {

    public String fromCadetToEbashka(Cadet cadet) {
        return String.format("%s: %d",cadet.getSecondName(),cadet.getEbashkaCount());
    }
}
