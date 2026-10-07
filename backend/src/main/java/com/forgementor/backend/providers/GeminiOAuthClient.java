package com.forgementor.backend.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.forgementor.backend.exceptions.GeminiModelBusyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class GeminiOAuthClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GeminiOAuthClient(RestClient.Builder restClientBuilder) {

        this.restClient = restClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();

        this.objectMapper = new ObjectMapper();
    }

    public String generate(String prompt, String authHeader) {

        String model = "gemini-3.8-flash";

        String response;
        try {
            response = restClient.post()
                    .uri("/v1beta/models/" + model + ":generateContent")
                    .header("Authorization", authHeader)
                    .header("Content-Type", "application/json")
                    .body("""
                            {
                              "contents": [
                                {
                                  "parts": [
                                    {
                                      "text": "%s"
                                    }
                                  ]
                                }
                              ]
                            }
                            """.formatted(prompt.replace("\"", "\\\"")))
                    .retrieve()
                    .body(String.class);
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == HttpStatus.SERVICE_UNAVAILABLE.value()) {
                String errorMsg = extractErrorMessage(e.getResponseBodyAsString());
                throw new GeminiModelBusyException(
                        errorMsg != null ? errorMsg : "Gemini model is currently overloaded. Please try again later.",
                        e
                );
            }
            throw e;
        }

        try {
            JsonNode root = objectMapper.readTree(response);

            JsonNode textNode = root
                    .path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode() || textNode.isNull()) {
                throw new IllegalStateException(
                        "Gemini response did not contain generated text: "
                                + response);
            }

            return textNode.asText();

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to parse Gemini response", e);
        }
    }

    private String extractErrorMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode messageNode = root.path("error").path("message");
            if (!messageNode.isMissingNode() && !messageNode.isNull() && !messageNode.asText().isBlank()) {
                return messageNode.asText();
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}