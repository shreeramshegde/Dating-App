package com.datingapp.security;

import com.datingapp.entity.Match;
import com.datingapp.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
@Slf4j
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final MatchRepository matchRepository;

    private static final Pattern MATCH_TOPIC_PATTERN = Pattern.compile("^/topic/match\\.([a-fA-F0-9\\-]+)$");

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        // 1. Authenticate on STOMP CONNECT frame
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = extractToken(accessor);

            if (!StringUtils.hasText(token) || !jwtTokenProvider.validateToken(token)) {
                log.warn("STOMP connect rejected: invalid or missing JWT token");
                throw new MessageDeliveryException("Unauthorized: Invalid or missing JWT token");
            }

            UUID userId = jwtTokenProvider.getUserIdFromToken(token);
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userId.toString(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
            );

            // Bind authenticated user to STOMP session
            accessor.setUser(auth);
            log.info("STOMP connected successfully for user: {}", userId);
        }

        // 2. Authorize subscriptions on STOMP SUBSCRIBE frame
        else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            Principal user = accessor.getUser();
            if (user == null) {
                log.warn("STOMP subscribe rejected: unauthenticated session");
                throw new MessageDeliveryException("Unauthorized: Unauthenticated subscription attempt");
            }

            String destination = accessor.getDestination();
            if (destination != null) {
                Matcher matcher = MATCH_TOPIC_PATTERN.matcher(destination);
                if (matcher.matches()) {
                    try {
                        UUID matchId = UUID.fromString(matcher.group(1));
                        UUID userId = UUID.fromString(user.getName());

                        Match match = matchRepository.findById(matchId)
                            .orElseThrow(() -> new MessageDeliveryException("Match not found"));

                        if (!match.getUser1Id().equals(userId) && !match.getUser2Id().equals(userId)) {
                            log.warn("User {} unauthorized to subscribe to match topic {}", userId, matchId);
                            throw new MessageDeliveryException("Forbidden: You are not a participant in this match");
                        }
                    } catch (IllegalArgumentException e) {
                        throw new MessageDeliveryException("Invalid match ID in subscription topic");
                    }
                }
            }
        }

        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders == null || authHeaders.isEmpty()) {
            authHeaders = accessor.getNativeHeader("authorization");
        }
        if (authHeaders == null || authHeaders.isEmpty()) {
            authHeaders = accessor.getNativeHeader("token");
        }

        if (authHeaders != null && !authHeaders.isEmpty()) {
            String header = authHeaders.get(0);
            if (StringUtils.hasText(header)) {
                if (header.startsWith("Bearer ")) {
                    return header.substring(7);
                }
                return header.trim();
            }
        }
        return null;
    }
}
