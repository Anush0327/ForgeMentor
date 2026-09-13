package com.forgementor.backend.services;

import org.springframework.stereotype.Service;

import com.forgementor.backend.dto.MentorRequest;
import com.forgementor.backend.dto.MentorResponse;

@Service
public class MentorService {

    public MentorResponse askMentor(MentorRequest request) {
        MentorResponse response = new MentorResponse();
        response.setResponse("Your request is " + request.getQuery());
        return response;
    }

    public MentorResponse giveHint(MentorRequest request) {
        MentorResponse response = new MentorResponse();
        response.setResponse("Your hint is " + request.getQuery());
        return response;
    }

    public MentorResponse explainCode(MentorRequest request) {
        MentorResponse response = new MentorResponse();
        response.setResponse("Your code is " + request.getQuery());
        return response;
    }

}
