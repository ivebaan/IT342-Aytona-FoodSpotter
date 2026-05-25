package edu.cit.aytona.foodspotter.features.favorites.repository;

import edu.cit.aytona.foodspotter.features.favorites.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    boolean existsByUser_EmailIgnoreCaseAndStall_Id(String email, Long stallId);

    Optional<Favorite> findByUser_EmailIgnoreCaseAndStall_Id(String email, Long stallId);

    List<Favorite> findByUser_EmailIgnoreCase(String email);

    void deleteByStall_Id(Long stallId);
}