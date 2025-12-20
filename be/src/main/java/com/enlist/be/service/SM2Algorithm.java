package com.enlist.be.service;

import lombok.Data;
import org.springframework.stereotype.Component;

@Component
public class SM2Algorithm {

    @Data
    public static class SM2Result {
        private int intervalDays;
        private double easeFactor;
        private int repetitions;
    }

    public SM2Result calculate(int quality, int currentInterval, double currentEaseFactor, int currentRepetitions) {
        SM2Result result = new SM2Result();

        double newEaseFactor = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (newEaseFactor < 1.3) {
            newEaseFactor = 1.3;
        }
        result.setEaseFactor(newEaseFactor);

        if (quality < 3) {
            result.setRepetitions(0);
            result.setIntervalDays(1);
        } else {
            int newRepetitions = currentRepetitions + 1;
            result.setRepetitions(newRepetitions);

            int newInterval;
            if (newRepetitions == 1) {
                newInterval = 1;
            } else if (newRepetitions == 2) {
                newInterval = 6;
            } else {
                newInterval = (int) Math.round(currentInterval * newEaseFactor);
            }
            result.setIntervalDays(newInterval);
        }

        return result;
    }
}
