package com.facebooklite.service;

import com.facebooklite.model.Comment;
import com.facebooklite.model.Post;
import com.facebooklite.model.User;
import com.facebooklite.repository.CommentRepository;
import com.facebooklite.repository.PostRepository;
import com.facebooklite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public Comment createComment(Long userId, Long postId, String content) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        Comment comment = new Comment(content, user, post);
        Comment savedComment = commentRepository.save(comment);
        
        // Update post comment count
        int currentCount = post.getCommentCount() != null ? post.getCommentCount() : 0;
        post.setCommentCount(currentCount + 1);
        postRepository.save(post);
        
        return savedComment;
    }
    
    @Transactional(readOnly = true)
    public List<Comment> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
        // Force load user data to avoid LazyInitializationException
        comments.forEach(comment -> {
            comment.getUser().getFirstName(); // Trigger lazy load
        });
        return comments;
    }
    
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own comments");
        }
        
        Post post = comment.getPost();
        commentRepository.delete(comment);
        
        // Update post comment count
        int currentCount = post.getCommentCount() != null ? post.getCommentCount() : 0;
        post.setCommentCount(Math.max(0, currentCount - 1));
        postRepository.save(post);
    }
}
