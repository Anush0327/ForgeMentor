package com.forgementor.backend.providers;

import java.util.Map;
import org.springframework.stereotype.Component;
import com.forgementor.backend.interfaces.MentorProvider;
import com.forgementor.backend.interfaces.MentorProviderResolver;
import com.forgementor.backend.exceptions.UnsupportedMentorModelException;

/**
 * MentorProviderResolverImp
 */
@Component
public class MentorProviderResolverImpl implements MentorProviderResolver {

    private final Map<String, MentorProvider> providers;

    public MentorProviderResolverImpl(Map<String, MentorProvider> providers) {
        this.providers = providers;
    }

    @Override
    public MentorProvider resolve(String modelName) {
        MentorProvider provider = providers.get(modelName);
        if (provider == null) {
            throw new UnsupportedMentorModelException("Invalid model name: " + modelName);
        }
        return provider;
    }
}