package com.meaowmatch.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RootAndHealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testRootEndpointReturnsWelcomeMessage() throws Exception {
        mockMvc.perform(get("/"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.application").value("MeaowMatch Backend API"))
            .andExpect(jsonPath("$.status").value("ONLINE"))
            .andExpect(jsonPath("$.documentation").value("/swagger-ui/index.html"));
    }

    @Test
    void testHealthEndpointReturnsStatus() throws Exception {
        mockMvc.perform(get("/health"))
            .andExpect(jsonPath("$.database").exists());
    }
}
