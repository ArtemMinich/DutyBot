package org.bot.duty.dutybotapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DutyBotApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(DutyBotApiApplication.class, args);
    }

}
