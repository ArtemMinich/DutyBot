package org.bot.duty.dutybotapi.repository;

import org.bot.duty.dutybotapi.entity.Light;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;

public interface LightRepository extends JpaRepository<Light, Long> {
    Light findFirstByOrderByCreatedAtDesc();

}