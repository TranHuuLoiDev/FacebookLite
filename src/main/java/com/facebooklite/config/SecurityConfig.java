package com.facebooklite.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                .anyRequest().permitAll()  // Cho phép tất cả requests mà không cần đăng nhập
            )
            .csrf(csrf -> csrf.disable())  // Tắt CSRF cho development
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));  // Cho phép H2 Console

        return http.build();
    }
}
