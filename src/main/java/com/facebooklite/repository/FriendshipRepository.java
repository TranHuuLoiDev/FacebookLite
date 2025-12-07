package com.facebooklite.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.facebooklite.model.Friendship;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    
    // Check if two users are friends
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Friendship f " +
           "WHERE f.userId = :userId AND f.friendId = :friendId")
    boolean areFriends(@Param("userId") Long userId, @Param("friendId") Long friendId);
    
    // Get all friends of a user
    @Query("SELECT f FROM Friendship f WHERE f.userId = :userId")
    List<Friendship> findAllByUserId(@Param("userId") Long userId);
    
    // Get friendship between two users
    Optional<Friendship> findByUserIdAndFriendId(Long userId, Long friendId);
    
    // Delete friendship
    void deleteByUserIdAndFriendId(Long userId, Long friendId);
}
