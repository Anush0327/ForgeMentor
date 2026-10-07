package com.forgementor.backend.providers;

import com.forgementor.backend.dto.MentorMode;
import com.forgementor.backend.dto.MentorProviderRequest;
import com.forgementor.backend.exceptions.GeminiModelBusyException;
import com.google.genai.errors.ServerException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GeminiProviderTest {

    @Mock
    private GoogleGenAiChatModel chatModel;

    @Mock
    private GeminiOAuthClient oauthClient;

    private GeminiProvider geminiProvider;

    @BeforeEach
    void setUp() {
        geminiProvider = new GeminiProvider(chatModel, oauthClient);
    }

    @Test
    void testGenerateThrowsGeminiModelBusyWhenServerException503Occurs() {
        ServerException serverException = new ServerException(503, "UNAVAILABLE", "The model is overloaded. Please try again later.");
        when(chatModel.call(anyString())).thenThrow(serverException);

        MentorProviderRequest request = new MentorProviderRequest();
        request.setModel("gemini");
        request.setMode(MentorMode.ASK);
        request.setQuery("Explain DI");

        GeminiModelBusyException ex = assertThrows(GeminiModelBusyException.class, () -> {
            geminiProvider.generate(request);
        });

        assertEquals("The model is overloaded. Please try again later.", ex.getMessage());
    }

    @Test
    void testGenerateThrowsGeminiModelBusyWhenGeneric503MessageOccurs() {
        RuntimeException runtimeException = new RuntimeException("503 Service Unavailable: The model is overloaded.");
        when(chatModel.call(anyString())).thenThrow(runtimeException);

        MentorProviderRequest request = new MentorProviderRequest();
        request.setModel("gemini");
        request.setMode(MentorMode.ASK);
        request.setQuery("Explain DI");

        GeminiModelBusyException ex = assertThrows(GeminiModelBusyException.class, () -> {
            geminiProvider.generate(request);
        });

        assertEquals("503 Service Unavailable: The model is overloaded.", ex.getMessage());
    }

    @Test
    void testOAuthDelegationThrowsGeminiModelBusy() {
        when(oauthClient.generate(anyString(), anyString()))
                .thenThrow(new GeminiModelBusyException("The model is overloaded. Please try again later."));

        MentorProviderRequest request = new MentorProviderRequest();
        request.setModel("gemini");
        request.setMode(MentorMode.ASK);
        request.setQuery("Explain DI");
        request.setAuthHeader("Bearer oauth-token");

        GeminiModelBusyException ex = assertThrows(GeminiModelBusyException.class, () -> {
            geminiProvider.generate(request);
        });

        assertEquals("The model is overloaded. Please try again later.", ex.getMessage());
    }
}
