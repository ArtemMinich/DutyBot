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
        System.out.println("Checking not free cadets...");
        List<Cadet> recordsToUpdate = cadetRepository.findByUpdatedAtBeforeAndEbashkaStatus(eightHoursAgo,true);
        if (recordsToUpdate.isEmpty()) {
            System.out.println("No cadets found");
        }
        recordsToUpdate.forEach(cadet -> {
            cadet.setUpdatedAt(LocalDateTime.now());
            cadet.setEbashkaStatus(false);
            cadetRepository.save(cadet);
        });
    }
}
