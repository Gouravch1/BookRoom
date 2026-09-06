package com.bookroom.backend.provider;

public interface LlmProvider {
    String generate(String prompt);
}
