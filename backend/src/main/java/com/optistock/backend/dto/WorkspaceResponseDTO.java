package com.optistock.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * DTO for workspace response in "my-workspaces" endpoint
 * Matches frontend requirement structure
 */
public class WorkspaceResponseDTO {
    private String id;              // Tenant MongoDB ID
    private String name;            // Workspace/Tenant name
    private String industryCode;    // Industry code (fmcg, electronics, etc.)
    private String role;            // User's role in this workspace (OWNER, MANAGER, STAFF)
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private LocalDateTime lastAccessed; // Last time user accessed this workspace

    // Constructors
    public WorkspaceResponseDTO() {
    }

    public WorkspaceResponseDTO(String id, String name, String industryCode, String role, LocalDateTime lastAccessed) {
        this.id = id;
        this.name = name;
        this.industryCode = industryCode;
        this.role = role;
        this.lastAccessed = lastAccessed;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIndustryCode() {
        return industryCode;
    }

    public void setIndustryCode(String industryCode) {
        this.industryCode = industryCode;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getLastAccessed() {
        return lastAccessed;
    }

    public void setLastAccessed(LocalDateTime lastAccessed) {
        this.lastAccessed = lastAccessed;
    }

    @Override
    public String toString() {
        return "WorkspaceResponseDTO{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", industryCode='" + industryCode + '\'' +
                ", role='" + role + '\'' +
                ", lastAccessed=" + lastAccessed +
                '}';
    }
}
