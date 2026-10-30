package com.meaowmatch.service;

import com.meaowmatch.dto.response.PresignedUploadResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.s3.endpoint}")
    private String endpoint;

    public PresignedUploadResponse generatePresignedUploadUrl(UUID userId, String contentType) {
        String fileExtension = getExtensionFromContentType(contentType);
        String fileKey = "pets/" + userId + "/" + UUID.randomUUID() + fileExtension;

        PutObjectRequest objectRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(fileKey)
            .contentType(contentType)
            .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(15))
            .putObjectRequest(objectRequest)
            .build();

        PresignedPutObjectRequest presignedPutObjectRequest = s3Presigner.presignPutObject(presignRequest);
        String uploadUrl = presignedPutObjectRequest.url().toString();

        String publicUrl = endpoint.replaceAll("/$", "") + "/" + bucketName + "/" + fileKey;

        return PresignedUploadResponse.builder()
            .uploadUrl(uploadUrl)
            .fileKey(fileKey)
            .publicUrl(publicUrl)
            .build();
    }

    public void deleteFile(String fileUrl) {
        try {
            String fileKey = extractKeyFromUrl(fileUrl);
            if (fileKey != null) {
                s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build());
            }
        } catch (Exception e) {
            log.error("Failed to delete S3 file: {}", fileUrl, e);
        }
    }

    private String extractKeyFromUrl(String fileUrl) {
        if (fileUrl == null) return null;
        String prefix = bucketName + "/";
        int idx = fileUrl.indexOf(prefix);
        if (idx != -1) {
            return fileUrl.substring(idx + prefix.length());
        }
        return null;
    }

    private String getExtensionFromContentType(String contentType) {
        if (contentType == null) return ".jpg";
        return switch (contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }
}
