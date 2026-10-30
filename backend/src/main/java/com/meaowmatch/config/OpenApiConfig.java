package com.meaowmatch.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI meaowMatchOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("MeaowMatch API — Pet Adoption & Emergency Animal Rescue Platform")
                .description("Production-ready REST and Real-Time STOMP WebSocket APIs for pet adopters, re-homers/shelters, and animal rescue reporters.")
                .version("v1.0.0")
                .contact(new Contact()
                    .name("MeaowMatch Core Engineering Team")
                    .email("support@meaowmatch.org"))
                .license(new License().name("MIT License")))
            .servers(List.of(
                new Server().url("/").description("Current Server (Local or Cloud EC2)")
            ))
            .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
            .components(new Components().addSecuritySchemes("Bearer Authentication",
                new SecurityScheme()
                    .name("Bearer Authentication")
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Enter your JWT token obtained from /api/v1/auth/login or /api/v1/auth/register")));
    }
}
