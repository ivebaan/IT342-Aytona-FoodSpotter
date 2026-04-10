package edu.cit.aytona.foodspotter.service.filter;

import edu.cit.aytona.foodspotter.entity.Stall;

import java.util.List;

public interface FilterStrategy {
    List<Stall> filter(List<Stall> stalls);
}
