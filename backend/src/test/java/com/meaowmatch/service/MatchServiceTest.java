package com.meaowmatch.service;

import com.meaowmatch.dto.response.MatchResponse;
import com.meaowmatch.entity.Match;
import com.meaowmatch.entity.Message;
import com.meaowmatch.entity.Pet;
import com.meaowmatch.entity.User;
import com.meaowmatch.repository.MatchRepository;
import com.meaowmatch.repository.MessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private PetService petService;

    @InjectMocks
    private MatchService matchService;

    private User user1;
    private User user2;
    private Pet pet;
    private Match match;

    @BeforeEach
    void setUp() {
        user1 = User.builder()
            .id(UUID.randomUUID())
            .email("user1@meaowmatch.org")
            .fullName("User One")
            .role(User.UserRole.ADOPTER)
            .build();

        user2 = User.builder()
            .id(UUID.randomUUID())
            .email("user2@meaowmatch.org")
            .fullName("User Two")
            .role(User.UserRole.REHOMER)
            .build();

        pet = Pet.builder()
            .id(UUID.randomUUID())
            .name("Rocky")
            .species(Pet.Species.DOG)
            .build();

        match = Match.builder()
            .id(UUID.randomUUID())
            .user1(user1)
            .user2(user2)
            .pet(pet)
            .matchType("ADOPTION")
            .isActive(true)
            .build();
    }

    @Test
    void testGetMatchesForUser() {
        when(matchRepository.findActiveMatchesByUserId(user1.getId())).thenReturn(List.of(match));
        when(messageRepository.findLatestMessage(match.getId())).thenReturn(Optional.of(
            Message.builder().content("Hi! Is Rocky still available?").build()
        ));
        when(messageRepository.countUnreadMessages(match.getId(), user1.getId())).thenReturn(1);

        List<MatchResponse> results = matchService.getMatchesForUser(user1.getId());
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(match.getId(), results.get(0).getMatchId());
        assertEquals("User Two", results.get(0).getMatchedUserName());
        assertEquals("Hi! Is Rocky still available?", results.get(0).getLastMessage());
        assertEquals(1, results.get(0).getUnreadCount());
    }

    @Test
    void testUnmatch() {
        when(matchRepository.findById(match.getId())).thenReturn(Optional.of(match));

        matchService.unmatch(user1.getId(), match.getId());
        assertFalse(match.getIsActive());
        verify(matchRepository).save(match);
    }
}
