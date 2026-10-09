package com.forgementor.backend.providers;

import org.springframework.stereotype.Component;

import com.forgementor.backend.interfaces.MentorProvider;
import com.forgementor.backend.dto.MentorProviderRequest;
import com.forgementor.backend.dto.MentorProviderResponse;
import com.forgementor.backend.dto.MentorMode;

import java.io.File;
import java.io.IOException;

import org.springframework.ai.google.genai.GoogleGenAiChatModel;

@Component("gemini")
public class GeminiProvider implements MentorProvider {

    private final GoogleGenAiChatModel chatModel;
    private final GeminiOAuthClient oauthClient;

    public GeminiProvider(
            GoogleGenAiChatModel chatModel,
            GeminiOAuthClient oauthClient) {

        this.chatModel = chatModel;
        this.oauthClient = oauthClient;
    }

    @Override
    public MentorProviderResponse generate(MentorProviderRequest request) {

        String prompt = buildPrompt(
                request.getMode(),
                request.getQuery()
        );

        String response;

        if (request.getAuthHeader() != null
                && request.getAuthHeader().startsWith("Bearer ")) {

            response = oauthClient.generate(
                    prompt,
                    request.getAuthHeader()
            );

        } else {

            // Temporary fallback to the existing Gemini API-key flow
            try {
                response = chatModel.call(prompt);
            } catch (Exception e) {
                if (isGemini503Exception(e)) {
                    String errorMsg = extract503Message(e);
                    throw new com.forgementor.backend.exceptions.GeminiModelBusyException(
                            errorMsg != null ? errorMsg : "Gemini model is currently overloaded. Please try again later.",
                            e
                    );
                }
                throw e;
            }
        }

        MentorProviderResponse mentorProviderResponse =
                new MentorProviderResponse();

        mentorProviderResponse.setResponse(response);

        return mentorProviderResponse;
    }

    private boolean isGemini503Exception(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof com.forgementor.backend.exceptions.GeminiModelBusyException) {
                return true;
            }
            if (current instanceof org.springframework.web.client.RestClientResponseException restEx
                    && restEx.getStatusCode().value() == 503) {
                return true;
            }
            if (current instanceof com.google.genai.errors.ApiException apiEx
                    && (apiEx.code() == 503 || "UNAVAILABLE".equalsIgnoreCase(apiEx.status()))) {
                return true;
            }
            String msg = current.getMessage();
            if (msg != null) {
                String lower = msg.toLowerCase();
                if ((lower.contains("503") || lower.contains("unavailable"))
                        && (lower.contains("overload") || lower.contains("busy") || lower.contains("service unavailable") || lower.contains("temporarily unavailable"))) {
                    return true;
                }
            }
            current = current.getCause();
        }
        return false;
    }

    private String extract503Message(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof com.google.genai.errors.ApiException apiEx) {
                if (apiEx.message() != null && !apiEx.message().isBlank()) {
                    return apiEx.message();
                }
            }
            if (current instanceof org.springframework.web.client.RestClientResponseException restEx) {
                String body = restEx.getResponseBodyAsString();
                if (body != null && body.contains("\"message\"")) {
                    try {
                        com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(body);
                        String msg = root.path("error").path("message").asText(null);
                        if (msg != null && !msg.isBlank()) {
                            return msg;
                        }
                    } catch (Exception ignored) {
                    }
                }
            }
            String msg = current.getMessage();
            if (msg != null && (msg.contains("overloaded") || msg.contains("overload") || msg.contains("busy"))) {
                return msg;
            }
            current = current.getCause();
        }
        return "Gemini model is currently overloaded. Please try again later.";
    }

    private String buildPrompt(MentorMode mode, String query) {

        return "You are ForgeMentor, a software engineering mentor.\n\n"
                + "Do not blindly solve problems for the developer.\n"
                + "Help them understand the reasoning.\n\n"
                + "Mode: " + mode + "\n\n"
                + "Developer question:\n" + query;
    }
}