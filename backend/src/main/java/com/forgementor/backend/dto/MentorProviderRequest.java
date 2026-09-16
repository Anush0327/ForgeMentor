package com.forgementor.backend.dto;

import lombok.Data;

@Data
public class MentorProviderRequest {

    private String query;

    private String model;

    private MentorMode mode;

}
