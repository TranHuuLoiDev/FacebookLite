package com.facebooklite.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.facebooklite.model.Friendship;
import com.facebooklite.repository.FriendshipRepository;

@RestController
@RequestMapping("/api/friendships")
public class FriendshipController {
    
    @Autowired
    private FriendshipRepository friendshipRepository;
    
    @GetMapping("/list/{userId}")
    public ResponseEntity<List<Friendship>> getFriendsList(@PathVariable Long userId) {
        try {
            List<Friendship> friends = friendshipRepository.findAllByUserId(userId);
            return ResponseEntity.ok(friends);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
