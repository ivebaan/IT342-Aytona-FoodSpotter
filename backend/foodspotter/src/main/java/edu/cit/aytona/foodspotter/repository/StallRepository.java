package edu.cit.aytona.foodspotter.repository;

import edu.cit.aytona.foodspotter.entity.Stall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StallRepository extends JpaRepository<Stall, Long> {
}
