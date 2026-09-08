package com.bookroom.backend.controller;

import com.bookroom.backend.dto.Request.AiChatRequest;
import com.bookroom.backend.dto.Response.AiChatResponse;
import com.bookroom.backend.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final AiService aiService;

    public AiController(AiService aiService){
        this.aiService = aiService;
    }

    // SEND PROMPT/REQUEST TO AI
    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest aiChatRequest){
        String response = aiService.chat(aiChatRequest.getMessage());
        return ResponseEntity.ok(new AiChatResponse(response));
    }
}
