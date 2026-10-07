package com.forgementor.backend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @GetMapping("/api/auth/test")
    public String testAuth(
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        if (authorization == null || authorization.isBlank()) {
            return "No Authorization header received";
        }

        if (!authorization.startsWith("Bearer ")) {
            return "Invalid Authorization header";
        }

        return "OAuth bearer token received";
    }
}