package edu.cit.aytona.foodspotter.features.stalls.application.filter;

import edu.cit.aytona.foodspotter.features.stalls.model.Stall;

import java.util.List;

public class PriceFilterStrategy implements FilterStrategy {

    @Override
    public List<Stall> filter(List<Stall> stalls) {
        return stalls;
    }
}
