package com.dao.fileservice.controller;

import com.dao.fileservice.FileStorageService;
import com.dao.fileservice.dto.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/files")
public class PublicFileController {

    private final FileStorageService fileStorageService;

    public PublicFileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<String> uploadFile(@RequestPart("file") MultipartFile file) {
        String fileUrl = fileStorageService.storeFile(file);
        return ApiResponse.success("Upload thanh cong", fileUrl);
    }

    @PostMapping(value = "/uploadMultiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<List<String>> uploadMultipleFiles(@RequestPart("files") MultipartFile[] files) {
        List<String> fileUrls = Arrays.stream(files)
                .map(fileStorageService::storeFile)
                .collect(Collectors.toList());
        return ApiResponse.success("Upload nhieu file thanh cong", fileUrls);
    }
}
