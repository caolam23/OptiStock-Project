package com.optistock.backend.repository;

import com.optistock.backend.model.Invitation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends MongoRepository<Invitation, String> {
    List<Invitation> findByTenantId(String tenantId);
    List<Invitation> findByInvitedEmail(String invitedEmail);
    Optional<Invitation> findByInvitationCode(String invitationCode);
    List<Invitation> findByTenantIdAndStatus(String tenantId, String status);
    List<Invitation> findByInvitedEmailAndStatus(String invitedEmail, String status);
}
