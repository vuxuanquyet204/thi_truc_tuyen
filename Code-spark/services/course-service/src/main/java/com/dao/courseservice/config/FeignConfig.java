package com.dao.courseservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Bean
    public FeignApiResponseDecoder feignApiResponseDecoder(ObjectMapper mapper) {
        return new FeignApiResponseDecoder(mapper);
    }
}
