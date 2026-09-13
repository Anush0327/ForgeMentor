package com.forgementor.backend.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.forgementor.backend.dto.MentorRequest;
import com.forgementor.backend.dto.MentorResponse;
import com.forgementor.backend.services.MentorService;

@RestController
@RequestMapping("/api")
public class MentorController {

    private final MentorService mentorService;

    MentorController(MentorService mentorService) {
        this.mentorService = mentorService;
    }

    @PostMapping("/ask-mentor")
    public MentorResponse askMentor(@RequestBody MentorRequest request) {
        return mentorService.askMentor(request);
    }

    @PostMapping("/give-hint")
    public MentorResponse giveHint(@RequestBody MentorRequest request) {
        return mentorService.giveHint(request);
    }

    @PostMapping("/explain-code")
    public MentorResponse explainCode(@RequestBody MentorRequest request) {
        return mentorService.explainCode(request);
    }
}