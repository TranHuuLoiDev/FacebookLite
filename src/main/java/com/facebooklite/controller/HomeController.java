package com.facebooklite.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "redirect:/html/login.html";
    }
    
    @GetMapping("/api/test")
    public String test() {
        return "{ \"status\": \"success\", \"message\": \"API hoạt động tốt!\", \"timestamp\": \"" + 
               java.time.LocalDateTime.now() + "\" }";
    }
}
