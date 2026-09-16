package com.forgementor.backend.providers;

import org.springframework.stereotype.Component;
import org.springframework.ai.openai.OpenAiChatModel;
import com.forgementor.backend.interfaces.MentorProvider;
import com.forgementor.backend.dto.MentorProviderRequest;
import com.forgementor.backend.dto.MentorProviderResponse;
import com.forgementor.backend.dto.MentorMode;

/**
 * OpenAIProvider
 */
@Component("openai")
public class OpenAIProvider implements MentorProvider {

    private final OpenAiChatModel chatModel;

    public OpenAIProvider(OpenAiChatModel chatModel) {
        this.chatModel = chatModel;
    }

    @Override
    public MentorProviderResponse generate(MentorProviderRequest request) {

        // OpenAiChatModel chatModel = OpenAiChatModel.builder()
        // .apiKey("${OPENAI_API_KEY}")
        // .model(request.getModel())
        // .build();

        String prompt = buildPrompt(request.getMode(), request.getQuery());
        MentorProviderResponse mentorProviderResponse = new MentorProviderResponse();
        String response = this.chatModel.call(prompt);
        mentorProviderResponse.setResponse(response);
        return mentorProviderResponse;
    }

    private String buildPrompt(MentorMode mode, String query) {

        String prompt = "You are ForgeMentor, a software engineering mentor.\n\n"
                + "Do not blindly solve problems for the developer.\n"
                + "Help them understand the reasoning.\n\n"
                + "Mode: " + mode + "\n\n"
                + "Developer question:\n" + query;

        return prompt;
    }

}