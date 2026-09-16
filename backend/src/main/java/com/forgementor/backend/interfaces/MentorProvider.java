package com.forgementor.backend.interfaces;

import com.forgementor.backend.dto.MentorProviderRequest;
import com.forgementor.backend.dto.MentorProviderResponse;

public interface MentorProvider {

    MentorProviderResponse generate(MentorProviderRequest request);
}
