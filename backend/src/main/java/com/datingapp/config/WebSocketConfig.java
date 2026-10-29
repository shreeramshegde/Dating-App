package com.datingapp.config;

import com.datingapp.security.StompAuthChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompAuthChannelInterceptor stompAuthChannelInterceptor;

    @Value("${app.cors.allowed-origins:*}")
    private String allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable simple in-memory message broker for topic & queue prefixes
        registry.enableSimpleBroker("/topic", "/queue");
        // Prefix for messages routed to @MessageMapping handler methods
        registry.setApplicationDestinationPrefixes("/app");
        // Prefix for user-specific destination
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Primary STOMP endpoint with SockJS fallback
        String[] patterns = Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toArray(String[]::new);

        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns(patterns.length == 0 ? new String[]{"*"} : patterns)
            .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Intercept and authenticate incoming STOMP frames (CONNECT, SUBSCRIBE, etc.)
        registration.interceptors(stompAuthChannelInterceptor);
    }
}
