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

    public String explainText(String selectedText){
        String prompt = """
            You are BookRoom's reading assistant.

            Explain the following selected text clearly and simply.

            Rules:
            - Stay focused on the provided text.
            - Explain difficult concepts in simple language.
            - Do not invent information that is not supported by the text.
            - Use examples when they genuinely help.

            Selected text:
            %s
            """.formatted(selectedText);

       return llmProvider.generate(prompt);
    }

    public String summarizeText(String selectedText){
         String prompt = """
            You are BookRoom's reading assistant.

            Summarize the following selected text.

            Rules:
            - Keep the original meaning.
            - Remove unnecessary repetition.
            - Do not add information that is not present in the text.
            - Make the summary concise but useful.

            Selected text:
            %s
            """.formatted(selectedText);

        return llmProvider.generate(prompt);
    }
}
