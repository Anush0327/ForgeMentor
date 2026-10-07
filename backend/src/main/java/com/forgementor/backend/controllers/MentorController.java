package com.forgementor.backend.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.forgementor.backend.dto.MentorRequest;
import com.forgementor.backend.dto.MentorResponse;
import com.forgementor.backend.services.MentorService;

import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api")
public class MentorController {

    private final MentorService mentorService;

    MentorController(MentorService mentorService) {
        this.mentorService = mentorService;
    }

    @PostMapping("/ask-mentor")
    public MentorResponse askMentor(@RequestHeader(value="Authorization", required=false) String authHeader, @RequestBody MentorRequest request) {
        System.out.println("CONTROLLER AUTH HEADER PRESENT: "
        + (authHeader != null));

        System.out.println("CONTROLLER AUTH HEADER LENGTH: "
        + (authHeader == null ? 0 : authHeader.length()));
        
        return mentorService.askMentor(request, authHeader);
    }

    @PostMapping("/give-hint")
    public MentorResponse giveHint(@RequestHeader(value="Authorization", required=false) String authHeader, @RequestBody MentorRequest request) {
        return mentorService.giveHint(request, authHeader);
    }

    @PostMapping("/explain-code")
    public MentorResponse explainCode(@RequestHeader(value="Authorization", required=false) String authHeader, @RequestBody MentorRequest request) {
        return mentorService.explainCode(request, authHeader);
    }
}