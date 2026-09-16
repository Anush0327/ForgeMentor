package com.forgementor.backend.providers;

import org.springframework.stereotype.Component;

import com.forgementor.backend.dto.MentorProviderRequest;
import com.forgementor.backend.dto.MentorProviderResponse;
import com.forgementor.backend.interfaces.MentorProvider;

@Component("mock")
public class MockMentorProvider implements MentorProvider {

    @Override
    public MentorProviderResponse generate(MentorProviderRequest request) {
        MentorProviderResponse response = new MentorProviderResponse();
        response.setResponse("Your response is " + request.getQuery());
        return response;
    }
}