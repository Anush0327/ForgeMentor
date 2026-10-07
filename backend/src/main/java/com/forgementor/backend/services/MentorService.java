package com.forgementor.backend.services;

import org.springframework.stereotype.Service;

import com.forgementor.backend.dto.MentorMode;
import com.forgementor.backend.dto.MentorProviderRequest;
import com.forgementor.backend.dto.MentorRequest;
import com.forgementor.backend.dto.MentorResponse;
import com.forgementor.backend.interfaces.MentorProviderResolver;

@Service
public class MentorService {

    private final MentorProviderResolver resolver;

    public MentorService(MentorProviderResolver resolver) {
        this.resolver = resolver;
    }

    // ── Private helper ────────────────────────────────────────────────────────

    private String generate(MentorRequest request, MentorMode mode, String authHeader) {
        MentorProviderRequest providerRequest = new MentorProviderRequest();
        providerRequest.setModel(request.getModel());
        providerRequest.setQuery(request.getQuery());
        providerRequest.setMode(mode);
        providerRequest.setAuthHeader(authHeader);
        return resolver.resolve(providerRequest.getModel())
                .generate(providerRequest)
                .getResponse();
    }

    private MentorResponse responseOf(String text) {
        MentorResponse response = new MentorResponse();
        response.setResponse(text);
        return response;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    public MentorResponse askMentor(MentorRequest request, String authHeader) {
        return responseOf(generate(request, MentorMode.ASK, authHeader));
    }

    public MentorResponse giveHint(MentorRequest request, String authHeader) {
        return responseOf(generate(request, MentorMode.HINT, authHeader));
    }

    public MentorResponse explainCode(MentorRequest request, String authHeader) {
        return responseOf(generate(request, MentorMode.EXPLAIN_CODE, authHeader));
    }

}
