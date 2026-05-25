package edu.cit.aytona.foodspotter.config;

import edu.cit.aytona.foodspotter.features.auth.model.User;
import edu.cit.aytona.foodspotter.features.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository userRepository;

    @Value("${app.bootstrap.admin-email:}")
    private String adminEmail;

    public AdminBootstrap(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        try {
            if (adminEmail == null || adminEmail.isBlank()) {
                log.info("AdminBootstrap skipped: app.bootstrap.admin-email is not configured");
                return;
            }

            userRepository.findByEmail(adminEmail).ifPresent(user -> {
                if (user.getRole() != User.Role.ADMIN) {
                    user.setRole(User.Role.ADMIN);
                    userRepository.save(user);
                    log.info("Promoted {} to ADMIN", adminEmail);
                } else {
                    log.info("User {} already has ADMIN role", adminEmail);
                }
            });
        } catch (Exception e) {
            log.warn("AdminBootstrap failed: {}", e.getMessage());
        }
    }
}
