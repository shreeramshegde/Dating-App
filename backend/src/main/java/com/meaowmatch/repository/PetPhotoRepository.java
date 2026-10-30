package com.meaowmatch.repository;

import com.meaowmatch.entity.PetPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PetPhotoRepository extends JpaRepository<PetPhoto, UUID> {
    List<PetPhoto> findByPetIdOrderByDisplayOrderAsc(UUID petId);
    void deleteByPetId(UUID petId);
}
