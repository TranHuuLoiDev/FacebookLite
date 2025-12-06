package com.facebooklite.service;

import com.facebooklite.model.Like;
import com.facebooklite.model.Post;
import com.facebooklite.model.User;
import com.facebooklite.repository.LikeRepository;
import com.facebooklite.repository.PostRepository;
import com.facebooklite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class LikeService {
    
    @Autowired
    private LikeRepository likeRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public Like toggleLike(Long userId, Long postId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        Optional<Like> existingLike = likeRepository.findByUserIdAndPostId(userId, postId);
        
        if (existingLike.isPresent()) {
            // Unlike
            likeRepository.delete(existingLike.get());
            
            // Update post like count
            int currentCount = post.getLikeCount() != null ? post.getLikeCount() : 0;
            post.setLikeCount(Math.max(0, currentCount - 1));
            postRepository.save(post);
            
            return null; // Return null to indicate unlike
        } else {
            // Like
            Like like = new Like(user, post);
            Like savedLike = likeRepository.save(like);
            
            // Update post like count
            int currentCount = post.getLikeCount() != null ? post.getLikeCount() : 0;
            post.setLikeCount(currentCount + 1);
            postRepository.save(post);
            
            return savedLike;
        }
    }
    
    public boolean isLikedByUser(Long userId, Long postId) {
        return likeRepository.existsByUserIdAndPostId(userId, postId);
    }
    
    public List<Like> getLikesByPostId(Long postId) {
        return likeRepository.findByPostId(postId);
    }
}
