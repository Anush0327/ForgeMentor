package com.forgementor.backend.exceptions;

public class GeminiModelBusyException extends RuntimeException {

    public GeminiModelBusyException(String message) {
        super(message);
    }

    public GeminiModelBusyException(String message, Throwable cause) {
        super(message, cause);
    }
}