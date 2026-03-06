package edu.cit.aytona.foodspotter.exception;

import edu.cit.aytona.foodspotter.dto.ApiResponse;
import edu.cit.aytona.foodspotter.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Validation errors (missing/invalid fields)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> details = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            details.put(error.getField(), error.getDefaultMessage());
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse.fail(ErrorResponse.builder()
                        .code("VALID-001")
                        .message("Validation failed")
                        .details(details)
                        .build())
        );
    }

    // Duplicate email registration
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicate(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiResponse.fail(ErrorResponse.builder()
                        .code("DB-002")
                        .message("Duplicate entry")
                        .details(ex.getMessage())
                        .build())
        );
    }

    // Invalid login credentials
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ApiResponse.fail(ErrorResponse.builder()
                        .code("AUTH-001")
                        .message("Invalid credentials")
                        .details("Email or password is incorrect")
                        .build())
        );
    }

    // Fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.fail(ErrorResponse.builder()
                        .code("SYSTEM-001")
                        .message("Internal server error")
                        .details(ex.getMessage())
                        .build())
        );
    }
}
