package org.bot.duty.dutybotapi.repository;

import org.bot.duty.dutybotapi.entity.Cadet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CadetRepository extends JpaRepository<Cadet, Long> {
    List<Cadet> findAllByEbashkaStatus(boolean b);

    List<Cadet> findByUpdatedAtBeforeAndEbashkaStatus(LocalDateTime time, boolean status);

}
