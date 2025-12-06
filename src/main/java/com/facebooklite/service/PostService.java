package com.facebooklite.service;

import com.facebooklite.model.Post;
import com.facebooklite.model.User;
import com.facebooklite.repository.PostRepository;
import com.facebooklite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public List<Post> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        // Force load user data to avoid LazyInitializationException
        posts.forEach(post -> {
            post.getUser().getFirstName(); // Trigger lazy load
        });
        return posts;
    }
    
    public Optional<Post> getPostById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Post ID cannot be null");
        }
        return postRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public List<Post> getPostsByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        List<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId);
        // Force load user data to avoid LazyInitializationException
        posts.forEach(post -> {
            post.getUser().getFirstName(); // Trigger lazy load
        });
        return posts;
    }
    
    public Post createPost(Post post, Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        post.setUser(user);
        return postRepository.save(post);
    }
    
    public Post updatePost(Long id, Post postDetails) {
        if (id == null) {
            throw new IllegalArgumentException("Post ID cannot be null");
        }
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        post.setContent(postDetails.getContent());
        post.setImageUrl(postDetails.getImageUrl());
        post.setVideoUrl(postDetails.getVideoUrl());
        post.setPrivacy(postDetails.getPrivacy());
        
        return postRepository.save(post);
    }
    
    public void deletePost(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Post ID cannot be null");
        }
        postRepository.deleteById(id);
    }
}
