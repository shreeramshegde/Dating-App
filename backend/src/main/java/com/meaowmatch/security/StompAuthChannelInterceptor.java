package com.meaowmatch.security;

import com.meaowmatch.entity.Match;
import com.meaowmatch.repository.MatchRepository;
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
            Principal userPrincipal = new UsernamePasswordAuthenticationToken(
                userId.toString(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
            );
            accessor.setUser(userPrincipal);
            log.info("STOMP user authenticated: {}", userId);
        }

        // 2. Authorize on SUBSCRIBE frame to match topics
        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            Principal userPrincipal = accessor.getUser();

            if (destination != null && userPrincipal != null) {
                Matcher matcher = MATCH_TOPIC_PATTERN.matcher(destination);
                if (matcher.matches()) {
                    String matchIdStr = matcher.group(1);
                    try {
                        UUID matchId = UUID.fromString(matchIdStr);
                        UUID userId = UUID.fromString(userPrincipal.getName());

                        Match match = matchRepository.findById(matchId)
                            .orElseThrow(() -> new MessageDeliveryException("Match not found"));

                        boolean isParticipant = match.getUser1().getId().equals(userId)
                            || match.getUser2().getId().equals(userId);

                        if (!isParticipant) {
                            log.warn("Unauthorized topic subscription attempt by user {} to match {}", userId, matchId);
                            throw new MessageDeliveryException("Forbidden: Not a participant of this conversation");
                        }
                    } catch (IllegalArgumentException e) {
                        throw new MessageDeliveryException("Invalid Match UUID in subscription destination");
                    }
                }
            }
        }

        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        List<String> passHeaders = accessor.getNativeHeader("passcode");
        if (passHeaders != null && !passHeaders.isEmpty()) {
            String passcode = passHeaders.get(0);
            if (StringUtils.hasText(passcode)) {
                return passcode.startsWith("Bearer ") ? passcode.substring(7) : passcode;
            }
        }

        return null;
    }
}
