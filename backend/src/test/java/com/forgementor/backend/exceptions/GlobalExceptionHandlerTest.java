package com.forgementor.backend.exceptions;

import com.google.genai.errors.ServerException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpServerErrorException;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void testHandleGeminiModelBusyException() {
        GeminiModelBusyException ex = new GeminiModelBusyException("The model is overloaded. Please try again later.");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleGeminiModelBusy(ex);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(503, response.getBody().getStatus());
        assertEquals("GEMINI_MODEL_BUSY", response.getBody().getError());
        assertEquals("The model is overloaded. Please try again later.", response.getBody().getMessage());
    }

    @Test
    void testHandleGoogleGenAiServerException503() {
        ServerException ex = new ServerException(503, "UNAVAILABLE", "Model is busy");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleGoogleGenAiApiException(ex);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(503, response.getBody().getStatus());
        assertEquals("GEMINI_MODEL_BUSY", response.getBody().getError());
        assertEquals("Model is busy", response.getBody().getMessage());
    }

    @Test
    void testHandleRestClientResponseException503() {
        String errorJson = """
                {
                    "error": {
                        "code": 503,
                        "message": "Resource has been exhausted or model overloaded",
                        "status": "UNAVAILABLE"
                    }
                }
                """;
        HttpServerErrorException ex = HttpServerErrorException.create(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Service Unavailable",
                HttpHeaders.EMPTY,
                errorJson.getBytes(StandardCharsets.UTF_8),
                StandardCharsets.UTF_8
        );

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleRestClientResponseException(ex);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(503, response.getBody().getStatus());
        assertEquals("GEMINI_MODEL_BUSY", response.getBody().getError());
        assertEquals("Resource has been exhausted or model overloaded", response.getBody().getMessage());
    }

    @Test
    void testHandleGeneralExceptionWithNested503() {
        GeminiModelBusyException rootCause = new GeminiModelBusyException("Deeply nested overload");
        RuntimeException wrapper = new RuntimeException("Outer failure", new IllegalStateException("Middle failure", rootCause));

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleGeneralException(wrapper);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(503, response.getBody().getStatus());
        assertEquals("GEMINI_MODEL_BUSY", response.getBody().getError());
        assertEquals("Deeply nested overload", response.getBody().getMessage());
    }

    @Test
    void testHandleUnsupportedMentorModelException() {
        UnsupportedMentorModelException ex = new UnsupportedMentorModelException("Invalid model name: claude");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleUnsupportedMentorModel(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("UNSUPPORTED_MODEL", response.getBody().getError());
        assertEquals("Invalid model name: claude", response.getBody().getMessage());
    }
}
