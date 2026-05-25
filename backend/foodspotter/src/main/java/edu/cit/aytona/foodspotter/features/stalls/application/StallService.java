package edu.cit.aytona.foodspotter.features.stalls.application;

import edu.cit.aytona.foodspotter.features.auth.model.User;
import edu.cit.aytona.foodspotter.features.auth.repository.UserRepository;
import edu.cit.aytona.foodspotter.features.favorites.repository.FavoriteRepository;
import edu.cit.aytona.foodspotter.features.stalls.application.filter.CuisineFilterStrategy;
import edu.cit.aytona.foodspotter.features.stalls.application.filter.FilterStrategy;
import edu.cit.aytona.foodspotter.features.stalls.dto.StallDTO;
import edu.cit.aytona.foodspotter.features.stalls.dto.StallRequest;
import edu.cit.aytona.foodspotter.features.stalls.dto.StallUpdateRequest;
import edu.cit.aytona.foodspotter.features.stalls.model.Stall;
import edu.cit.aytona.foodspotter.features.stalls.model.StallStatus;
import edu.cit.aytona.foodspotter.features.stalls.repository.StallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class StallService {

    private static final long MAX_IMAGE_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final double LOCATION_DUPLICATE_THRESHOLD = 0.0005d;

    private final StallRepository stallRepository;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;

    public StallDTO createStall(String userEmail, StallRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        validateImageProof(request.getImageUrl(), request.getImageSizeBytes());

        Double latitude = parseCoordinate(request.getLatitude(), "latitude");
        Double longitude = parseCoordinate(request.getLongitude(), "longitude");

        if (isDuplicateStall(request, latitude, longitude)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A similar stall already exists");
        }

        Stall stall = Stall.builder()
                .stallName(request.getName().trim())
                .description(request.getDescription().trim())
                .cuisine(request.getCuisine().trim())
                .imageUrl(trimToNull(request.getImageUrl()))
                .imageSizeBytes(request.getImageSizeBytes())
                .address(trimToNull(request.getAddress()))
                .menuJson(null)
                .latitude(latitude)
                .longitude(longitude)
                .status(StallStatus.PENDING.name())
                .submittedBy(user)
                .build();

        return toDTO(stallRepository.save(stall));
    }

    public StallDTO getStall(Long id) {
        Stall stall = stallRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stall not found"));

        if (!StallStatus.APPROVED.name().equalsIgnoreCase(stall.getStatus())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Stall not found");
        }

        return toDTO(stall);
    }

    public List<StallDTO> getAllStallsDTO() {
        return stallRepository.findAll().stream()
                .filter(stall -> StallStatus.APPROVED.name().equalsIgnoreCase(stall.getStatus()))
                .map(this::toDTO)
                .toList();
    }

    public List<StallDTO> getAllAdminStalls() {
        return stallRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public List<StallDTO> getApprovedStalls() {
        return stallRepository.findAll().stream()
                .filter(stall -> StallStatus.APPROVED.name().equalsIgnoreCase(stall.getStatus()))
                .map(this::toDTO)
                .toList();
    }

    public List<StallDTO> filterByCuisine(String cuisine) {
        List<Stall> approved = stallRepository.findAll().stream()
                .filter(stall -> StallStatus.APPROVED.name().equalsIgnoreCase(stall.getStatus()))
                .toList();

        FilterStrategy strategy = new CuisineFilterStrategy(cuisine);
        return strategy.filter(approved).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<StallDTO> getPendingStalls() {
        return stallRepository.findAll().stream()
                .filter(stall -> StallStatus.PENDING.name().equalsIgnoreCase(stall.getStatus()))
                .map(this::toDTO)
                .toList();
    }

    public List<StallDTO> getStallsByOwnerEmail(String ownerEmail) {
        return stallRepository.findAll().stream()
                .filter(stall -> stall.getSubmittedBy() != null && ownerEmail.equalsIgnoreCase(stall.getSubmittedBy().getEmail()))
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public StallDTO approveStall(Long id) {
        Stall stall = stallRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stall not found"));

        User submitter = stall.getSubmittedBy();
        if (submitter != null && submitter.getRole() == User.Role.USER) {
            submitter.setRole(User.Role.VENDOR);
            userRepository.save(submitter);
        }

        stall.setStatus(StallStatus.APPROVED.name());
        return toDTO(stallRepository.save(stall));
    }

    public StallDTO clearMenu(Long id) {
        Stall stall = stallRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stall not found"));
        stall.setMenuJson(null);
        return toDTO(stallRepository.save(stall));
    }

    @Transactional
    public StallDTO rejectStall(Long id) {
        Stall stall = stallRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stall not found"));
        StallDTO removed = toDTO(stall);
        favoriteRepository.deleteByStall_Id(id);
        stallRepository.delete(stall);
        return removed;
    }

    public StallDTO updateStall(String userEmail, Long id, StallUpdateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Stall stall = stallRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stall not found"));

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
            String imageUrl = trimToNull(request.getImageUrl());
            validateImageProof(imageUrl, request.getImageSizeBytes());
            stall.setImageUrl(imageUrl);
            stall.setImageSizeBytes(request.getImageSizeBytes());
        }

        if (request.getAddress() != null) {
            stall.setAddress(trimToNull(request.getAddress()));
        }

        if (request.getMenuJson() != null) {
            stall.setMenuJson(request.getMenuJson().trim().isEmpty() ? null : request.getMenuJson().trim());
        }

        if (request.getLatitude() != null && !request.getLatitude().trim().isEmpty()) {
            stall.setLatitude(parseCoordinate(request.getLatitude(), "latitude"));
        }

        if (request.getLongitude() != null && !request.getLongitude().trim().isEmpty()) {
            stall.setLongitude(parseCoordinate(request.getLongitude(), "longitude"));
        }

        return toDTO(stallRepository.save(stall));
    }

    @Transactional
    public void deleteStall(Long id) {
        Stall stall = stallRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stall not found"));
        favoriteRepository.deleteByStall_Id(id);
        stallRepository.delete(stall);
    }

    private StallDTO toDTO(Stall stall) {
        return StallDTO.builder()
                .id(stall.getId())
                .name(stall.getStallName())
                .description(stall.getDescription())
                .cuisine(stall.getCuisine())
                .imageUrl(stall.getImageUrl())
                .imageSizeBytes(stall.getImageSizeBytes())
                .address(stall.getAddress())
                .menuJson(stall.getMenuJson())
                .latitude(stall.getLatitude())
                .longitude(stall.getLongitude())
                .status(stall.getStatus())
                .ownerEmail(stall.getSubmittedBy() != null ? stall.getSubmittedBy().getEmail() : null)
                .build();
    }

    private void validateImageProof(String imageUrl, Long imageSizeBytes) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one stall image is required");
        }

        String normalized = imageUrl.trim().toLowerCase(Locale.ROOT);
        boolean validExtension = normalized.endsWith(".jpg")
                || normalized.endsWith(".jpeg")
                || normalized.endsWith(".png")
                || normalized.contains(".jpg?")
                || normalized.contains(".jpeg?")
                || normalized.contains(".png?");

        if (!validExtension) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPG and PNG images are allowed");
        }

        if (imageSizeBytes != null && imageSizeBytes > MAX_IMAGE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image must be 5MB or smaller");
        }
    }

    private boolean isDuplicateStall(StallRequest request, Double latitude, Double longitude) {
        String normalizedName = normalizeText(request.getName());
        String normalizedCuisine = normalizeText(request.getCuisine());
        String normalizedAddress = normalizeText(request.getAddress());

        return stallRepository.findAll().stream().anyMatch(existing -> {
            String existingName = normalizeText(existing.getStallName());
            String existingCuisine = normalizeText(existing.getCuisine());
            String existingAddress = normalizeText(existing.getAddress());

            boolean sameName = !normalizedName.isEmpty() && normalizedName.equals(existingName);
            boolean sameCuisine = !normalizedCuisine.isEmpty() && normalizedCuisine.equals(existingCuisine);
            boolean sameAddress = !normalizedAddress.isEmpty() && !existingAddress.isEmpty()
                    && (existingAddress.contains(normalizedAddress) || normalizedAddress.contains(existingAddress));
            boolean nearLocation = existing.getLatitude() != null && existing.getLongitude() != null
                    && Math.abs(existing.getLatitude() - latitude) <= LOCATION_DUPLICATE_THRESHOLD
                    && Math.abs(existing.getLongitude() - longitude) <= LOCATION_DUPLICATE_THRESHOLD;

            return (sameName && nearLocation)
                    || (sameName && sameAddress)
                    || (sameName && sameCuisine && nearLocation)
                    || (sameAddress && sameCuisine && nearLocation);
        });
    }

    private Double parseCoordinate(String rawValue, String fieldName) {
        try {
            return Double.parseDouble(rawValue);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid " + fieldName + " value");
        }
    }

    private String normalizeText(String value) {
        if (value == null) {
            return "";
        }

        return value.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "");
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
