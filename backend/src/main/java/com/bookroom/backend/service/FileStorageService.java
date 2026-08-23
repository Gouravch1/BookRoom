package com.bookroom.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
   StoredFile upload(MultipartFile file);
   String generateAccessUrl(String publicId , Integer version);
   void delete(String fileUrl);
}
