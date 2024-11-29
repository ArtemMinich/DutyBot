package org.bot.duty.dutybotapi.util;

import lombok.AllArgsConstructor;
import org.bot.duty.dutybotapi.entity.Cadet;
import org.bot.duty.dutybotapi.repository.CadetRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class Timer {

    private CadetRepository cadetRepository;

    @Scheduled(fixedRate = 60000)
    public void updateFieldsAfterEightHours() {
        LocalDateTime eightHoursAgo = LocalDateTime.now().minusHours(8);
        List<Cadet> recordsToUpdate = cadetRepository.findByUpdatedAtBeforeAndEbashkaStatus(eightHoursAgo,true);
        recordsToUpdate.forEach(cadet -> {
            cadet.setUpdatedAt(LocalDateTime.now());
            cadet.setEbashkaStatus(false);
            cadetRepository.save(cadet);
        });
    }
}
