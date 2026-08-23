package com.bookroom.backend.service;


import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import com.bookroom.backend.service.StoredFile;
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
    public StoredFile upload(MultipartFile file) {

        try {

            String publicId =
                    "bookroom/pdfs/" + UUID.randomUUID() + ".pdf";

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "resource_type", "raw",
                                    "type", "authenticated",
                                    "public_id", publicId,
                                    "unique_filename", false,
                                    "use_filename", false
                            )
                    );

            String uploadedPublicId =
                    uploadResult.get("public_id").toString();

            Integer version =
                    ((Number) uploadResult.get("version")).intValue();

            return new StoredFile(uploadedPublicId , version);

        } catch (IOException e) {

            throw new RuntimeException(
                    "PDF upload failed: " + e.getMessage()
            );
        }
    }

    @Override
    public void delete(String publicId) {
        try {
            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "type", "authenticated"
                    )
            );
        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to delete PDF: " + e.getMessage()
            );
        }
    }

    @Override
    public String generateAccessUrl(String publicId , Integer version) {
        return cloudinary.url()
                .resourceType("raw")
                .type("authenticated")
                .secure(true)
                .signed(true)
                .version(version)
                .publicId(publicId)
                .generate();
    }

    private String extractPublicId(String fileUrl) {
        // URL: https://res.cloudinary.com/xxx/raw/upload/v123/bookroom/pdfs/uuid.pdf

        String afterUpload = fileUrl.substring(fileUrl.indexOf("/upload/") + 8);

        String withoutVersion = afterUpload.substring(afterUpload.indexOf("/") + 1);

        return withoutVersion.replace(".pdf", "");
    }




}
