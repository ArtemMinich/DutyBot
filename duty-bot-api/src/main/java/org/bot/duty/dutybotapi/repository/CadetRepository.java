package org.bot.duty.dutybotapi.repository;

import org.bot.duty.dutybotapi.entity.Cadet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CadetRepository extends JpaRepository<Cadet, Long> {
}
