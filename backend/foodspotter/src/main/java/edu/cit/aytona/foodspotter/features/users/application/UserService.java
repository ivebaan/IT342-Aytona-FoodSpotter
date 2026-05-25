package edu.cit.aytona.foodspotter.features.users.application;

import edu.cit.aytona.foodspotter.features.auth.dto.UserDTO;
import edu.cit.aytona.foodspotter.features.auth.model.User;
import edu.cit.aytona.foodspotter.features.auth.repository.UserRepository;
import edu.cit.aytona.foodspotter.features.users.dto.RoleUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDTO getCurrentUser(String email) {
        return toDTO(getUserByEmail(email));
    }

    public void deleteMyAccount(String actorEmail) {
        User actor = getUserByEmail(actorEmail);
        if (actor.getRole() != User.Role.USER) {
            throw new AccessDeniedException("Only USER accounts can self-delete");
        }
        userRepository.delete(actor);
    }

    public void deleteAccount(String actorEmail, Long targetUserId) {
        User actor = getUserByEmail(actorEmail);
        User target = getUserById(targetUserId);

        if (actor.getId().equals(target.getId())) {
            deleteMyAccount(actorEmail);
            return;
        }

        switch (actor.getRole()) {
            case SUPER_ADMIN -> {
                if (target.getRole() == User.Role.SUPER_ADMIN) {
                    throw new AccessDeniedException("SUPER_ADMIN accounts cannot be removed by another user");
                }
                userRepository.delete(target);
            }
            case ADMIN -> {
                if (target.getRole() != User.Role.USER) {
                    throw new AccessDeniedException("ADMIN can only delete USER accounts");
                }
                userRepository.delete(target);
            }
            default -> throw new AccessDeniedException("You are not allowed to delete accounts");
        }
    }

    public UserDTO updateRole(String actorEmail, Long targetUserId, RoleUpdateRequest request) {
        User actor = getUserByEmail(actorEmail);
        User target = getUserById(targetUserId);
        User.Role requestedRole = parseRole(request.getRole());

        if (actor.getRole() == User.Role.ADMIN) {
            if (target.getRole() != User.Role.USER || requestedRole != User.Role.VENDOR) {
                throw new AccessDeniedException("ADMIN can only assign vendor status to USER accounts");
            }
        } else if (requestedRole == User.Role.VENDOR) {
            throw new AccessDeniedException("Only ADMIN can assign vendor status");
        }

        if ((requestedRole == User.Role.ADMIN || requestedRole == User.Role.SUPER_ADMIN)
                && actor.getRole() != User.Role.SUPER_ADMIN) {
            throw new AccessDeniedException("Only SUPER_ADMIN can assign admin roles");
        }

        if (target.getRole() == User.Role.SUPER_ADMIN && actor.getRole() != User.Role.SUPER_ADMIN) {
            throw new AccessDeniedException("Only SUPER_ADMIN can modify SUPER_ADMIN accounts");
        }

        target.setRole(requestedRole);
        return toDTO(userRepository.save(target));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private User.Role parseRole(String rawRole) {
        try {
            return User.Role.valueOf(rawRole.trim().toUpperCase());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role value");
        }
    }

    private UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}