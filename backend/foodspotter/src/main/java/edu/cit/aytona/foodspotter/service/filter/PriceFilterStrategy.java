package edu.cit.aytona.foodspotter.service.filter;

import edu.cit.aytona.foodspotter.entity.Stall;

import java.util.List;

public class PriceFilterStrategy implements FilterStrategy {

    // Placeholder: pricing not yet modeled on Stall; keep behavior as pass-through.

    @Override
    public List<Stall> filter(List<Stall> stalls) {
        return stalls;
    }
}
