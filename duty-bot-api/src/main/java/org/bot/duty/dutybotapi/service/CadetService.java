package org.bot.duty.dutybotapi.service;

import lombok.AllArgsConstructor;
import org.bot.duty.dutybotapi.entity.Cadet;
import org.bot.duty.dutybotapi.mapper.CadetEbashkaMapper;
import org.bot.duty.dutybotapi.repository.CadetRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CadetService {

    private CadetRepository cadetRepository;

    public String giveEbashkaCadets(String args) {
        if(!canParseToInt(args)) {
            return "Введіть правильні дані";
        }
        int numberCadets = Integer.parseInt(args);
        if(numberCadets < 1) {
            return "Не можна дати менше 1 людини";
        }
        if(numberCadets > 11) {
            return "Забагато, не можемо стільки дати";
        }
        List<Cadet> cadets = cadetRepository.findAll();
        List<String> ebashkaCadets = cadets.stream()
                .sorted(Comparator.comparingInt(Cadet::getEbashkaCount))
                .map(Cadet::getSecondName)
                .limit(numberCadets)
                .toList();
        return String.join(", ", ebashkaCadets);
    }

    public String getAllEbashkaCadets() {
        return null;
    }

    private boolean canParseToInt(String str) {
        if (str == null || str.isEmpty()) {
            return false;
        }
        try {
            Integer.parseInt(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
