package org.bot.duty.dutybotapi.service;

import lombok.RequiredArgsConstructor;
import org.bot.duty.dutybotapi.entity.Ebashka;
import org.bot.duty.dutybotapi.repository.EbashkaRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EbashkaService {

    private final EbashkaRepository ebashkaRepository;

    public void save(String ebashkaList) {
        ebashkaRepository.save(new Ebashka(ebashkaList));
    }
}
