package org.bot.duty.dutybotapi.dto;

import java.util.List;
import java.util.Map;

public class PollResults {
    private Map<String, List<Integer>> results;

    public Map<String, List<Integer>> get() {
        return results;
    }
}
