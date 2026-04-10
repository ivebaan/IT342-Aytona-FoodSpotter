package edu.cit.aytona.foodspotter.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = AllowedCuisineValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface AllowedCuisine {
    String message() default "Cuisine must be one of the allowed choices";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
