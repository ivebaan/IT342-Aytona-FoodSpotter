package edu.cit.aytona.foodspotter.features.stalls.application;

import edu.cit.aytona.foodspotter.features.auth.model.User;
import edu.cit.aytona.foodspotter.features.auth.repository.UserRepository;
import edu.cit.aytona.foodspotter.features.stalls.application.filter.CuisineFilterStrategy;
import edu.cit.aytona.foodspotter.features.stalls.application.filter.FilterStrategy;
import edu.cit.aytona.foodspotter.features.stalls.dto.StallDTO;
import edu.cit.aytona.foodspotter.features.stalls.dto.StallRequest;
import edu.cit.aytona.foodspotter.features.stalls.dto.StallUpdateRequest;
import edu.cit.aytona.foodspotter.features.stalls.model.Stall;
import edu.cit.aytona.foodspotter.features.stalls.repository.StallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
public class StallService {

    private final StallRepository stallRepository;
    private final UserRepository userRepository;

    public StallDTO createStall(String userEmail, StallRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == User.Role.USER) {
            user.setRole(User.Role.VENDOR);
            userRepository.save(user);
        }

        Stall stall = Stall.builder()
                .stallName(request.getName())
                .description(request.getDescription())
                .cuisine(request.getCuisine())
            .imageUrl(null)
            .menuJson(null)
                .latitude(Double.parseDouble(request.getLatitude()))
                .longitude(Double.parseDouble(request.getLongitude()))
                .status("PENDING")
                .submittedBy(user)
                .build();

        return toDTO(stallRepository.save(stall));
    }

    public StallDTO getStall(Long id) {
        Stall stall = stallRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stall not found"));
        return toDTO(stall);
    }

    public java.util.List<StallDTO> getAllStallsDTO() {
        return stallRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public java.util.List<StallDTO> getApprovedStalls() {
        return stallRepository.findAll().stream()
            .filter(s -> "APPROVED".equalsIgnoreCase(s.getStatus()))
            .map(this::toDTO)
            .toList();
    }

    public java.util.List<StallDTO> filterByCuisine(String cuisine) {
        java.util.List<Stall> approved = stallRepository.findAll().stream()
            .filter(s -> "APPROVED".equalsIgnoreCase(s.getStatus()))
            .toList();

        FilterStrategy strategy = new CuisineFilterStrategy(cuisine);
        return strategy.filter(approved).stream()
            .map(this::toDTO)
            .toList();
    }

    public java.util.List<StallDTO> getPendingStalls() {
        return stallRepository.findAll().stream()
                .filter(s -> "PENDING".equalsIgnoreCase(s.getStatus()))
                .map(this::toDTO)
                .toList();
    }

    public java.util.List<StallDTO> getStallsByOwnerEmail(String ownerEmail) {
        return stallRepository.findAll().stream()
                .filter(s -> s.getSubmittedBy() != null && ownerEmail.equalsIgnoreCase(s.getSubmittedBy().getEmail()))
                .map(this::toDTO)
                .toList();
    }

    public StallDTO approveStall(Long id) {
        Stall stall = stallRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stall not found"));
        stall.setStatus("APPROVED");
        return toDTO(stallRepository.save(stall));
    }

    public StallDTO updateStall(String userEmail, Long id, StallUpdateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Stall stall = stallRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stall not found"));

        if (stall.getSubmittedBy() == null || !stall.getSubmittedBy().getEmail().equalsIgnoreCase(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only modify your own stall");
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            stall.setStallName(request.getName().trim());
        }

        if (request.getDescription() != null && !request.getDescription().trim().isEmpty()) {
            stall.setDescription(request.getDescription().trim());
        }

        if (request.getCuisine() != null && !request.getCuisine().trim().isEmpty()) {
            stall.setCuisine(request.getCuisine().trim());
        }

        if (request.getImageUrl() != null) {
            stall.setImageUrl(request.getImageUrl().trim().isEmpty() ? null : request.getImageUrl().trim());
        }

        if (request.getMenuJson() != null) {
            stall.setMenuJson(request.getMenuJson().trim().isEmpty() ? null : request.getMenuJson().trim());
        }

        if (request.getLatitude() != null && !request.getLatitude().trim().isEmpty()) {
            stall.setLatitude(Double.parseDouble(request.getLatitude()));
        }

        if (request.getLongitude() != null && !request.getLongitude().trim().isEmpty()) {
            stall.setLongitude(Double.parseDouble(request.getLongitude()));
        }

        return toDTO(stallRepository.save(stall));
    }

    public void deleteStall(Long id) {
        stallRepository.deleteById(id);
    }

    private StallDTO toDTO(Stall stall) {
        return StallDTO.builder()
                .id(stall.getId())
                .name(stall.getStallName())
                .description(stall.getDescription())
                .cuisine(stall.getCuisine())
                .imageUrl(stall.getImageUrl())
                .menuJson(stall.getMenuJson())
                .latitude(stall.getLatitude())
                .longitude(stall.getLongitude())
                .status(stall.getStatus())
                .ownerEmail(stall.getSubmittedBy() != null ? stall.getSubmittedBy().getEmail() : null)
                .build();
    }
}
