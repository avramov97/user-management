package org.westernacher.solutions.config;

import org.modelmapper.ModelMapper;
import org.westernacher.solutions.domain.models.binding.UserRoleFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class ApplicationBeanConfiguration {
    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserRoleFactory userRoleFactory() { return new UserRoleFactory();
    }
}
