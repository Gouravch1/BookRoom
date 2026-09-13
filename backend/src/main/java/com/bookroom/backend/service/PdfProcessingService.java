package com.bookroom.backend.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class PdfProcessingService {

    public String extractPageText(
            byte[] pdfBytes,
            int pageNumber
    ) {

        if (pdfBytes == null || pdfBytes.length == 0) {
            throw new IllegalArgumentException("PDF content is empty");
        }

        try (PDDocument document = Loader.loadPDF(pdfBytes)) {

            int totalPages = document.getNumberOfPages();

            if (pageNumber < 1 || pageNumber > totalPages) {
                throw new IllegalArgumentException(
                        "Invalid page number: " + pageNumber
                );
            }

            PDFTextStripper stripper = new PDFTextStripper();

            stripper.setStartPage(pageNumber);
            stripper.setEndPage(pageNumber);

            return stripper.getText(document).trim();

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Failed to extract text from PDF page",
                    e
            );
        }
    }
}