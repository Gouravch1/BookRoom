package com.bookroom.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.bookroom.backend.common.BookNotFoundException;
import com.bookroom.backend.entity.Book;
import com.bookroom.backend.provider.LlmProvider;
import com.bookroom.backend.repository.BookRepository;


@Service 
public class AiService {
    private final LlmProvider llmProvider;
    private final BookRepository bookRepository;
    private final BookAccessService bookAccessService;
    private final FileStorageService fileStorageService;
    private final PdfProcessingService pdfProcessingService;
    private final RestClient restClient;

    public AiService(
            LlmProvider llmProvider,
            BookRepository bookRepository,
            BookAccessService bookAccessService,
            FileStorageService fileStorageService,
            PdfProcessingService pdfProcessingService,
            RestClient.Builder restClient
    ) {
        this.llmProvider = llmProvider;
        this.bookRepository = bookRepository;
        this.bookAccessService = bookAccessService;
        this.fileStorageService = fileStorageService;
        this.pdfProcessingService = pdfProcessingService;
        this.restClient = restClient.build();
    }

    // Normal Chat
    public String chat(String message){
        String prompt = """ 
                You're an AI assistant for BookRoom. 
                Answer the user's question correctly, clearly and accurately. 
                User :
                %s
                """.formatted(message);
        return llmProvider.generate(prompt);
    }

    // Explain Text
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

    // Summarize Text
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

    public String explainPage(Long id , Integer pageNumber , String email){
        Book book = bookRepository.findById(id).orElseThrow(() -> new BookNotFoundException("Book Not Found!"));

        bookAccessService.requireReadAccess(
            book,
            email
        );

        String signedUrl =
            fileStorageService.generateAccessUrl(
                    book.getStoragePublicId(),
                    book.getStorageVersion()
            );

    byte[] pdfBytes = restClient.get()
        .uri(signedUrl)
        .retrieve()
        .body(byte[].class);
        

    if (pdfBytes == null || pdfBytes.length == 0) {
        throw new IllegalStateException(
                "Failed to download PDF"
        );
    }

    String pageText =
            pdfProcessingService.extractPageText(
                    pdfBytes,
                    pageNumber
            );

    if (pageText.isBlank()) {
        throw new IllegalStateException(
                "No readable text found on this page"
        );
    }

    String prompt = """
            You are BookRoom's reading assistant.

            Explain the following page in a clear and easy-to-understand way.

            Rules:
            - Explain the concepts present on the page.
            - Keep the explanation faithful to the page content.
            - Do not invent facts that are not supported by the page.
            - Use simple language.
            - Give examples only when they help understanding.

            Page content:
            %s
            """.formatted(pageText);

    return llmProvider.generate(prompt);
    }
}
