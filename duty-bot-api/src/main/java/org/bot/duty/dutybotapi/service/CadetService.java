package org.bot.duty.dutybotapi.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.bot.duty.dutybotapi.entity.Cadet;
import org.bot.duty.dutybotapi.repository.CadetRepository;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@AllArgsConstructor
public class CadetService {

    private CadetRepository cadetRepository;

    private EbashkaService ebashkaService;

    public String giveEbashkaCadets(String args) {
        if (canNotParseToInt(args)) {
            return "Введіть правильні дані";
        }
        int numberCadets = Integer.parseInt(args);
        if (numberCadets < 1) {
            return "Не можна дати менше 1 людини";
        }
        if (numberCadets > 11) {
            return "Забагато, не можемо стільки дати";
        }
        List<Cadet> ebashkaCadets = cadetRepository.findAll().stream()
                .sorted(Comparator.comparingInt(Cadet::getEbashkaCount))
                .filter(c -> !c.isEbashkaStatus())
                .limit(numberCadets)
                .toList();
        String ebashkaList = String.join(", ", addEbashkaCadets(ebashkaCadets));
        ebashkaService.save(ebashkaList);
        return ebashkaList;
    }

    public String getAllEbashkaCadets() {
        return String.join("\n", cadetRepository.findAll().stream()
                .map(c -> String.format("%d.%s: %d - %s", c.getId(), c.getLastName(), c.getEbashkaCount(), c.isEbashkaStatus() ? "⛔️" : "✅"))
                .toList());
    }

    public String addEbashka(String args) {
        try {
            Cadet cadet = getCadetFromArgs(args);
            cadet.setEbashkaCount(cadet.getEbashkaCount() + 1);
            cadetRepository.save(cadet);
            String cadets = String.format("Додано єбашку: %s", getCadetById(cadet.getId()));
            ebashkaService.save(cadet.getLastName());
            return cadets;
        } catch (IllegalArgumentException | EntityNotFoundException e) {
            return e.getMessage();
        }

    }

    public String removeEbashka(String args) {
        try {
            Cadet cadet = getCadetFromArgs(args);
            cadet.setEbashkaCount(cadet.getEbashkaCount() - 1);
            cadetRepository.save(cadet);
            return String.format("Відняли єбашку: %s", getCadetById(cadet.getId()));
        } catch (IllegalArgumentException | EntityNotFoundException e) {
            return e.getMessage();
        }
    }

    public String setFreeEbashka(String args) {
        try {
            Cadet cadet = getCadetFromArgs(args);
            cadet.setEbashkaStatus(false);
            cadet.setUpdatedAt(LocalDateTime.now());
            cadetRepository.save(cadet);
            return String.format("Прийшов з єбашки: %s", getCadetById(cadet.getId()));
        } catch (IllegalArgumentException | EntityNotFoundException e) {
            return e.getMessage();
        }
    }

    public String setNotFreeEbashka(String args) {
        try {
            Cadet cadet = getCadetFromArgs(args);
            cadet.setEbashkaStatus(true);
            cadet.setUpdatedAt(LocalDateTime.now());
            cadetRepository.save(cadet);
            return String.format("Відправили на єбашку: %s", getCadetById(cadet.getId()));
        } catch (IllegalArgumentException | EntityNotFoundException e) {
            return e.getMessage();
        }
    }

    private Cadet getCadetFromArgs(String args) {
        if (canNotParseToInt(args)) throw new IllegalArgumentException("Введіть правильні дані");
        int idCadet = Integer.parseInt(args);
        if (idCadet < 1 || idCadet > 11) throw new IllegalArgumentException("Введіть правильний номер курсанта");
        return cadetRepository.findById((long) idCadet).orElseThrow(() -> new EntityNotFoundException("Незнайдено такого курсанта"));
    }

    private boolean canNotParseToInt(String str) {
        if (str == null || str.isEmpty()) {
            return true;
        }
        try {
            Integer.parseInt(str);
            return false;
        } catch (NumberFormatException e) {
            return true;
        }
    }

    private List<String> addEbashkaCadets(List<Cadet> cadets) {
        cadets.forEach(c -> {
            c.setEbashkaStatus(true);
            c.setUpdatedAt(LocalDateTime.now());
            c.setEbashkaCount(c.getEbashkaCount() + 1);
            cadetRepository.save(c);
        });
        return cadets.stream().map(Cadet::getLastName).toList();
    }

    public List<Cadet> getIdsCadetsByStatus(boolean status) {
        return cadetRepository.findAllByEbashkaStatus(status).stream().toList();
    }

    public String getCadetById(Long id) {
        return cadetRepository.findById(id)
                .map(c -> String.format("%d.%s: %d - %s", c.getId(), c.getLastName(), c.getEbashkaCount(), c.isEbashkaStatus() ? "⛔️" : "✅"))
                .orElse(null);
    }

    public List<Cadet> getAllCadets() {
        return cadetRepository.findAll();
    }

    public Cadet getCadetByChatId(String chatId) {
        Cadet cadet = new Cadet();
        return switch (chatId) {
            case "1305742188" -> {
                cadet.setLastName("Мазур");
                yield cadet;
            }
            case "799128809" -> {
                cadet.setLastName("Іванов");
                yield cadet;
            }
            case "818667420" -> {
                cadet.setLastName("Маслов");
                yield cadet;
            }
            default -> cadetRepository.findByChatId(chatId).orElse(null);
        };
    }
}
