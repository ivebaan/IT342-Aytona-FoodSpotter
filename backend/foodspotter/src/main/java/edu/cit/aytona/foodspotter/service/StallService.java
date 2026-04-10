package edu.cit.aytona.foodspotter.service;

import edu.cit.aytona.foodspotter.dto.StallDTO;
import edu.cit.aytona.foodspotter.dto.StallRequest;
import edu.cit.aytona.foodspotter.entity.Stall;
import edu.cit.aytona.foodspotter.entity.User;
import edu.cit.aytona.foodspotter.repository.StallRepository;
import edu.cit.aytona.foodspotter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StallService {

    private final StallRepository stallRepository;
    private final UserRepository userRepository;

    public StallDTO createStall(String userEmail, StallRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Stall stall = Stall.builder()
                .stallName(request.getName())
                .description(request.getDescription())
                .cuisine(request.getCuisine())
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

    public java.util.List<StallDTO> getApprovedStalls() {
        return stallRepository.findAll().stream()
                .filter(s -> "APPROVED".equalsIgnoreCase(s.getStatus()))
                .map(this::toDTO)
                .toList();
    }

    public java.util.List<StallDTO> filterByCuisine(String cuisine) {
        return stallRepository.findAll().stream()
                .filter(s -> "APPROVED".equalsIgnoreCase(s.getStatus()))
                .filter(s -> cuisine == null || s.getCuisine().equalsIgnoreCase(cuisine))
                .map(this::toDTO)
                .toList();
    }

    public java.util.List<StallDTO> getPendingStalls() {
        return stallRepository.findAll().stream()
                .filter(s -> "PENDING".equalsIgnoreCase(s.getStatus()))
                .map(this::toDTO)
                .toList();
    }

    public StallDTO approveStall(Long id) {
        Stall stall = stallRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stall not found"));
        stall.setStatus("APPROVED");
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
                .latitude(stall.getLatitude())
                .longitude(stall.getLongitude())
                .status(stall.getStatus())
                .build();
    }
}
