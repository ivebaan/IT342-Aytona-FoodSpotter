package edu.cit.aytona.foodspotter.features.stalls.repository;

import edu.cit.aytona.foodspotter.features.stalls.model.Stall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StallRepository extends JpaRepository<Stall, Long> {
}
