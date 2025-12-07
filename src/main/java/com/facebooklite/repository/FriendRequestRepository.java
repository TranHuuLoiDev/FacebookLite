package com.facebooklite.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.facebooklite.model.FriendRequest;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    
    // Find pending friend request between two users
    @Query("SELECT fr FROM FriendRequest fr WHERE " +
           "((fr.sender.id = :userId1 AND fr.receiver.id = :userId2) OR " +
           "(fr.sender.id = :userId2 AND fr.receiver.id = :userId1)) AND " +
           "fr.status = 'PENDING'")
    Optional<FriendRequest> findPendingRequestBetweenUsers(
        @Param("userId1") Long userId1, 
        @Param("userId2") Long userId2
    );
    
    // Get all pending requests received by a user
    @Query("SELECT fr FROM FriendRequest fr WHERE fr.receiver.id = :userId AND fr.status = 'PENDING'")
    List<FriendRequest> findPendingRequestsByReceiver(@Param("userId") Long userId);
    
    // Get all pending requests sent by a user
    @Query("SELECT fr FROM FriendRequest fr WHERE fr.sender.id = :userId AND fr.status = 'PENDING'")
    List<FriendRequest> findPendingRequestsBySender(@Param("userId") Long userId);
    
    // Count pending requests for a user
    @Query("SELECT COUNT(fr) FROM FriendRequest fr WHERE fr.receiver.id = :userId AND fr.status = 'PENDING'")
    Long countPendingRequestsByReceiver(@Param("userId") Long userId);
    
    // Find request by sender and receiver
    Optional<FriendRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);
    
    // Find all requests between two users (any status)
    @Query("SELECT fr FROM FriendRequest fr WHERE " +
           "(fr.sender.id = :userId1 AND fr.receiver.id = :userId2) OR " +
           "(fr.sender.id = :userId2 AND fr.receiver.id = :userId1)")
    List<FriendRequest> findRequestsBetweenUsers(
        @Param("userId1") Long userId1, 
        @Param("userId2") Long userId2
    );
    
    // Check if request exists with any status
    @Query("SELECT CASE WHEN COUNT(fr) > 0 THEN true ELSE false END FROM FriendRequest fr WHERE " +
           "((fr.sender.id = :userId1 AND fr.receiver.id = :userId2) OR " +
           "(fr.sender.id = :userId2 AND fr.receiver.id = :userId1))")
    boolean existsRequestBetweenUsers(
        @Param("userId1") Long userId1, 
        @Param("userId2") Long userId2
    );
}
