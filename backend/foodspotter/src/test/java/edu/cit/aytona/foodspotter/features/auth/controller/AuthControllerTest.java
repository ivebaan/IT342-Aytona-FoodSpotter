package edu.cit.aytona.foodspotter.features.auth.controller;

import edu.cit.aytona.foodspotter.features.auth.application.AuthService;
import edu.cit.aytona.foodspotter.features.auth.dto.AuthData;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import edu.cit.aytona.foodspotter.security.JwtAuthenticationFilter;
import edu.cit.aytona.foodspotter.security.SecurityConfig;
import edu.cit.aytona.foodspotter.security.UserDetailsServiceImpl;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
    controllers = AuthController.class,
    excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class),
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class),
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = UserDetailsServiceImpl.class)
    },
    excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class,
        UserDetailsServiceAutoConfiguration.class
    }
)
@AutoConfigureMockMvc(addFilters = false)
@Import(AuthControllerTest.TestAuthConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private AuthService authService;

    @TestConfiguration
    static class TestAuthConfig {
        @Bean
        AuthService authService() {
            return Mockito.mock(AuthService.class);
        }
    }

    @Test
    void login_endpoint_returns_ok() throws Exception {
        AuthData data = new AuthData();
        Mockito.when(authService.login(Mockito.any())).thenReturn(data);

        mvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"a@b.com\",\"password\":\"pw123456\"}"))
            .andExpect(status().isOk());
    }
}
