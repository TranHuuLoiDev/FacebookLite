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
    
    @Autowired
    private NotificationService notificationService;
    
    @Transactional
    public Comment createComment(Long userId, Long postId, String content) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        Comment comment = new Comment(content, user, post);
        Comment savedComment = commentRepository.save(comment);
        
        // Update post comment count
        Integer currentCount = post.getCommentCount();
        post.setCommentCount(currentCount != null ? currentCount + 1 : 1);
        postRepository.save(post);
        
        // Create notification for post owner
        notificationService.createNotification(
            post.getUser().getId(),
            userId,
            "comment",
            user.getFirstName() + " " + user.getLastName() + " đã bình luận: " + 
            (content.length() > 50 ? content.substring(0, 50) + "..." : content),
            postId
        );
        
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
        Integer currentCount = post.getCommentCount();
        post.setCommentCount(currentCount != null ? Math.max(0, currentCount - 1) : 0);
        postRepository.save(post);
    }
}
