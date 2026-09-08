package com.bookroom.backend.service;

import org.springframework.stereotype.Service;
import com.bookroom.backend.provider.LlmProvider;


@Service 
public class AiService {
    private final LlmProvider llmProvider;

    public AiService(LlmProvider llmProvider){
        this.llmProvider = llmProvider;
    }

    public String chat(String message){
        String prompt = """ 
                You're an AI assistant for BookRoom. 
                Answer the user's question correctly, clearly and accurately. 
                User :
                %s
                """.formatted(message);
        return llmProvider.generate(prompt);
    }
}
