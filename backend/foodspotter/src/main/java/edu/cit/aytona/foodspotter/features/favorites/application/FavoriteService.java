package edu.cit.aytona.foodspotter.features.favorites.application;

import edu.cit.aytona.foodspotter.features.auth.model.User;
import edu.cit.aytona.foodspotter.features.auth.repository.UserRepository;
import edu.cit.aytona.foodspotter.features.favorites.model.Favorite;
import edu.cit.aytona.foodspotter.features.favorites.repository.FavoriteRepository;
import edu.cit.aytona.foodspotter.features.stalls.application.StallService;
import edu.cit.aytona.foodspotter.features.stalls.dto.StallDTO;
import edu.cit.aytona.foodspotter.features.stalls.model.Stall;
import edu.cit.aytona.foodspotter.features.stalls.model.StallStatus;
import edu.cit.aytona.foodspotter.features.stalls.repository.StallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final StallRepository stallRepository;
    private final StallService stallService;

    public StallDTO addFavorite(String userEmail, Long stallId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Stall stall = stallRepository.findById(stallId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stall not found"));

        if (!StallStatus.APPROVED.name().equalsIgnoreCase(stall.getStatus())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Stall not found");
        }

        if (favoriteRepository.existsByUser_EmailIgnoreCaseAndStall_Id(userEmail, stallId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already favorited this stall");
        }

        favoriteRepository.save(Favorite.builder().user(user).stall(stall).build());
        return stallService.getStall(stallId);
    }

    public void removeFavorite(String userEmail, Long stallId) {
        Favorite favorite = favoriteRepository.findByUser_EmailIgnoreCaseAndStall_Id(userEmail, stallId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Favorite not found"));
        favoriteRepository.delete(favorite);
    }

    public List<StallDTO> getFavorites(String userEmail) {
        Map<Long, StallDTO> approvedById = stallService.getAllStallsDTO().stream()
            .collect(Collectors.toMap(StallDTO::getId, dto -> dto));

        return favoriteRepository.findByUser_EmailIgnoreCase(userEmail).stream()
                .map(Favorite::getStall)
                .filter(stall -> stall != null && StallStatus.APPROVED.name().equalsIgnoreCase(stall.getStatus()))
            .map(stall -> approvedById.getOrDefault(stall.getId(), stallService.getStall(stall.getId())))
                .toList();
    }
}