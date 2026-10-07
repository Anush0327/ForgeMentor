package com.forgementor.backend.controllers;

import com.forgementor.backend.dto.MentorRequest;
import com.forgementor.backend.exceptions.GeminiModelBusyException;
import com.forgementor.backend.exceptions.GlobalExceptionHandler;
import com.forgementor.backend.exceptions.UnsupportedMentorModelException;
import com.forgementor.backend.services.MentorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class MentorControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MentorService mentorService;

    @BeforeEach
    void setUp() {
        MentorController controller = new MentorController(mentorService);
        this.mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void testAskMentorWhenGeminiReturns503ModelBusy() throws Exception {
        when(mentorService.askMentor(any(MentorRequest.class), any()))
                .thenThrow(new GeminiModelBusyException("The model is overloaded. Please try again later."));

        String requestJson = """
                {
                    "model": "gemini",
                    "query": "Explain dependency injection in Spring Boot"
                }
                """;

        mockMvc.perform(post("/api/ask-mentor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(503))
                .andExpect(jsonPath("$.error").value("GEMINI_MODEL_BUSY"))
                .andExpect(jsonPath("$.message").value("The model is overloaded. Please try again later."));
    }

    @Test
    void testGiveHintWhenGeminiReturns503ModelBusy() throws Exception {
        when(mentorService.giveHint(any(MentorRequest.class), any()))
                .thenThrow(new GeminiModelBusyException("Gemini model is currently overloaded. Please try again later."));

        String requestJson = """
                {
                    "model": "gemini",
                    "query": "How to fix NullPointerException?"
                }
                """;

        mockMvc.perform(post("/api/give-hint")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(503))
                .andExpect(jsonPath("$.error").value("GEMINI_MODEL_BUSY"))
                .andExpect(jsonPath("$.message").value("Gemini model is currently overloaded. Please try again later."));
    }

    @Test
    void testExplainCodeWhenGeminiReturns503ModelBusy() throws Exception {
        when(mentorService.explainCode(any(MentorRequest.class), any()))
                .thenThrow(new GeminiModelBusyException("Model unavailable"));

        String requestJson = """
                {
                    "model": "gemini",
                    "query": "public void test() {}"
                }
                """;

        mockMvc.perform(post("/api/explain-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(503))
                .andExpect(jsonPath("$.error").value("GEMINI_MODEL_BUSY"))
                .andExpect(jsonPath("$.message").value("Model unavailable"));
    }

    @Test
    void testUnsupportedModelReturnsBadRequest() throws Exception {
        when(mentorService.askMentor(any(MentorRequest.class), any()))
                .thenThrow(new UnsupportedMentorModelException("Invalid model name: unknown"));

        String requestJson = """
                {
                    "model": "unknown",
                    "query": "Hello"
                }
                """;

        mockMvc.perform(post("/api/ask-mentor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("UNSUPPORTED_MODEL"))
                .andExpect(jsonPath("$.message").value("Invalid model name: unknown"));
    }
}
