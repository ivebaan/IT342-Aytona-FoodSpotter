package edu.cit.aytona.foodspotter.service.filter;

import edu.cit.aytona.foodspotter.entity.Stall;

import java.util.List;
import java.util.Locale;

public class CuisineFilterStrategy implements FilterStrategy {

    private final String cuisine;

    public CuisineFilterStrategy(String cuisine) {
        this.cuisine = cuisine;
    }

    @Override
    public List<Stall> filter(List<Stall> stalls) {
        if (cuisine == null || cuisine.isBlank()) {
            return stalls;
        }
        final String cuisineLower = cuisine.toLowerCase(Locale.ROOT);
        return stalls.stream()
                .filter(s -> s.getCuisine() != null && s.getCuisine().toLowerCase(Locale.ROOT).equals(cuisineLower))
                .toList();
    }
}
