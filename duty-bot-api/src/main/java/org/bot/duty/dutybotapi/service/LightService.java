package org.bot.duty.dutybotapi.service;

import lombok.AllArgsConstructor;
import org.bot.duty.dutybotapi.entity.Light;
import org.bot.duty.dutybotapi.repository.LightRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
@AllArgsConstructor
public class LightService {
    private final LightRepository lightRepository;

    public Light getLastLight() {
        return lightRepository.findFirstByOrderByCreatedAtDesc();
    }

    public Light save(String light) {
        Light lightEntity = new Light();
        lightEntity.setLight(light);
        return lightRepository.save(lightEntity);
    }
}
