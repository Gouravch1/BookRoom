package com.bookroom.backend.service;


import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class CloudinaryStorageService implements FileStorageService{

    private final Cloudinary cloudinary;

    public CloudinaryStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public String upload(MultipartFile file) {
        try {
            String publicId = UUID.randomUUID().toString() + ".pdf";

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "folder", "bookroom/pdfs",
                            "public_id", publicId,
                            "unique_filename", false,
                            "use_filename", false
                    )
            );

            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            throw new RuntimeException("PDF upload failed: " + e.getMessage());
        }
    }

    @Override
    public void delete(String fileUrl) {
        try {
            String publicId = extractPublicId(fileUrl);

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap("resource_type", "raw")
            );

        } catch (IOException e) {
            throw new RuntimeException("Failed to delete PDF: " + e.getMessage());
        }
    }

    private String extractPublicId(String fileUrl) {
        // URL: https://res.cloudinary.com/xxx/raw/upload/v123/bookroom/pdfs/uuid.pdf

        String afterUpload = fileUrl.substring(fileUrl.indexOf("/upload/") + 8);

        String withoutVersion = afterUpload.substring(afterUpload.indexOf("/") + 1);

        return withoutVersion.replace(".pdf", "");
    }


}
