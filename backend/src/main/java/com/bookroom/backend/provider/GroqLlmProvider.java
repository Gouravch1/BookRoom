package com.bookroom.backend.provider;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class GroqLlmProvider implements LlmProvider{
    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public GroqLlmProvider(RestClient.Builder restClientBuilder,
                           @Value("${groq.api-key}") String apiKey,
                           @Value("${groq.model}") String model){
        this.restClient = restClientBuilder
                .baseUrl("https://api.groq.com/openai/v1")
                .build();

        this.apiKey = apiKey;
        this.model = model;
    }


    @Override
   public String generate(String prompt){
        GroqChatRequest request = new GroqChatRequest(model,
                List.of(
                        new GroqMessage("user", prompt)
                ));


        GroqChatResponse response = restClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(GroqChatResponse.class);

        if (response == null
                || response.choices() == null
                || response.choices().isEmpty()
                || response.choices().get(0).message() == null) {

            throw new IllegalStateException("Empty response received from Groq");
        }

        return response.choices().get(0).message().content();
   }

    private record GroqChatRequest(
            String model,
            List<GroqMessage> messages
    ) {
    }

    private record GroqMessage(
            String role,
            String content
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GroqChatResponse(
            List<GroqChoice> choices
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GroqChoice(
            GroqResponseMessage message
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GroqResponseMessage(
            String role,
            String content
    ) {
    }
}
