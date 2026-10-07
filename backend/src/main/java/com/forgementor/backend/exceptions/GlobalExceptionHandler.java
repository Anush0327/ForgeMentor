package com.forgementor.backend.exceptions;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientResponseException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @ExceptionHandler(GeminiModelBusyException.class)
    public ResponseEntity<ErrorResponse> handleGeminiModelBusy(
            GeminiModelBusyException ex) {

        String message = ex.getMessage();
        if (message == null || message.isBlank()) {
            message = "Gemini model is currently overloaded. Please try again later.";
        }

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "GEMINI_MODEL_BUSY",
                message
        );

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(errorResponse);
    }

    @ExceptionHandler(com.google.genai.errors.ApiException.class)
    public ResponseEntity<ErrorResponse> handleGoogleGenAiApiException(
            com.google.genai.errors.ApiException ex) {

        if (ex.code() == HttpStatus.SERVICE_UNAVAILABLE.value() || "UNAVAILABLE".equalsIgnoreCase(ex.status())) {
            String message = ex.message() != null && !ex.message().isBlank()
                    ? ex.message()
                    : "Gemini model is currently overloaded. Please try again later.";

            ErrorResponse errorResponse = new ErrorResponse(
                    HttpStatus.SERVICE_UNAVAILABLE.value(),
                    "GEMINI_MODEL_BUSY",
                    message
            );

            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(errorResponse);
        }

        HttpStatus status = HttpStatus.resolve(ex.code());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        ErrorResponse errorResponse = new ErrorResponse(
                status.value(),
                ex.status() != null ? ex.status() : "GEMINI_API_ERROR",
                ex.message()
        );

        return ResponseEntity.status(status).body(errorResponse);
    }

    @ExceptionHandler(RestClientResponseException.class)
    public ResponseEntity<ErrorResponse> handleRestClientResponseException(
            RestClientResponseException ex) {

        if (ex.getStatusCode().value() == HttpStatus.SERVICE_UNAVAILABLE.value()) {
            String message = extractErrorMessage(ex.getResponseBodyAsString());
            ErrorResponse errorResponse = new ErrorResponse(
                    HttpStatus.SERVICE_UNAVAILABLE.value(),
                    "GEMINI_MODEL_BUSY",
                    message != null ? message : "Gemini model is currently overloaded. Please try again later."
            );

            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(errorResponse);
        }

        ErrorResponse errorResponse = new ErrorResponse(
                ex.getStatusCode().value(),
                "EXTERNAL_SERVICE_ERROR",
                ex.getMessage()
        );

        return ResponseEntity.status(ex.getStatusCode()).body(errorResponse);
    }

    @ExceptionHandler(UnsupportedMentorModelException.class)
    public ResponseEntity<ErrorResponse> handleUnsupportedMentorModel(
            UnsupportedMentorModelException ex) {

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "UNSUPPORTED_MODEL",
                ex.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        Throwable current = ex;
        while (current != null) {
            if (current instanceof GeminiModelBusyException busyEx) {
                return handleGeminiModelBusy(busyEx);
            }
            if (current instanceof com.google.genai.errors.ApiException apiEx
                    && (apiEx.code() == HttpStatus.SERVICE_UNAVAILABLE.value() || "UNAVAILABLE".equalsIgnoreCase(apiEx.status()))) {
                return handleGoogleGenAiApiException(apiEx);
            }
            if (current instanceof RestClientResponseException restEx
                    && restEx.getStatusCode().value() == HttpStatus.SERVICE_UNAVAILABLE.value()) {
                return handleRestClientResponseException(restEx);
            }
            current = current.getCause();
        }

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_SERVER_ERROR",
                ex.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
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