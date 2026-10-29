package com.datingapp.repository;

import com.datingapp.entity.ProfilePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfilePhotoRepository extends JpaRepository<ProfilePhoto, UUID> {
    List<ProfilePhoto> findByProfileUserIdOrderByDisplayOrderAsc(UUID userId);
    void deleteByIdAndProfileUserId(UUID photoId, UUID userId);
}
