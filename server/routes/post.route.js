// Create a new post
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create_post', authMiddleware, (req, res) => {
    const { content, imageUrl } = req.body; // Destructure imageUrl
    const userId = req.user.id;

    // Insert the post
    const query = "INSERT INTO posts (user_id, content) VALUES (?, ?)";
    db.query(query, [userId, content], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Failed to create post." });
        }

        const postId = result.insertId; // Get the ID of the newly created post

        // Insert the image URL if it exists
        if (imageUrl) {
            const imageQuery = "INSERT INTO images (post_id, image_url) VALUES (?, ?)";
            db.query(imageQuery, [postId, imageUrl], (err) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to insert image." });
                }
                return res.json({ msg: "Post created with image" });
            });
        } else {
            // No imageUrl provided
            return res.json({ msg: "Post created without image" });
        }
    });
});

  // Retrieve all posts (with pagination)
 // Retrieve all posts (with pagination)
 router.get('/get_all', authMiddleware, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // Default limit is 5
    const offset = (page - 1) * limit;
    const userId = req.user.id; // Get the logged-in user's ID

    // First, get the total count of posts
    const countQuery = `SELECT COUNT(*) AS totalPosts FROM posts`;

    db.query(countQuery, (countErr, countResult) => {
        if (countErr) throw countErr;

        const totalPosts = countResult[0].totalPosts; // Get the total number of posts
        const totalPages = Math.ceil(totalPosts / limit); // Calculate total pages

        // Now fetch the paginated posts with total likes, user's like status, and follow status
        const postsQuery = `
            SELECT posts.*, images.image_url, 
                   CASE WHEN likes.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS likePost,
                   CASE WHEN follows.follower_id IS NOT NULL THEN TRUE ELSE FALSE END AS isFollow,
                   (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS totalLikes
            FROM posts
            LEFT JOIN images ON posts.id = images.post_id
            LEFT JOIN likes ON posts.id = likes.post_id AND likes.user_id = ?
            LEFT JOIN follows ON posts.user_id = follows.following_id AND follows.follower_id  = ?
            ORDER BY posts.created_at DESC
            LIMIT ? OFFSET ?`;

        db.query(postsQuery, [userId, userId, limit, offset], (err, results) => {
            if (err) throw err;

            // Send the posts along with pagination and totalLikes information
            res.json({
                currentPage: page,
                totalPages,
                totalPosts,
                posts: results
            });
        });
    });
});






router.get('/single_post/:id', authMiddleware, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id; // Get the logged-in user's ID

    try {
        // Fetch post data
        const postQuery = `
            SELECT posts.*, 
                   posts.user_id AS postAuthorId,
                   COUNT(likes.id) AS like_count,
                   CASE WHEN likes.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS likePost
            FROM posts
            LEFT JOIN likes ON posts.id = likes.post_id AND likes.user_id = ?
            WHERE posts.id = ?
            GROUP BY posts.id
        `;

        const [postResult] = await db.promise().query(postQuery, [userId, postId]);

        if (postResult.length === 0) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const postAuthorId = postResult[0].postAuthorId;

        // Check if the logged-in user follows the post author
        const followQuery = `
            SELECT * FROM follows WHERE follower_id  = ? AND following_id = ?
        `;
        const [followResult] = await db.promise().query(followQuery, [userId, postAuthorId]);

        const isFollow = followResult.length > 0;

        // Fetch associated images
        const imageQuery = `
            SELECT image_url FROM images WHERE post_id = ?
        `;
        const [imagesResult] = await db.promise().query(imageQuery, [postId]);

        const post = {
            ...postResult[0],
            images: imagesResult.map(img => img.image_url),
            isFollow, // Include isFollow in the response
        };

        res.json(post);
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
});




  
  // Like a post
// Like a post
router.post('/like_post/:id', authMiddleware, (req, res) => {
    const userId = req.user.id;
    const postId = req.params.id;

    // Check if the user has already liked the post
    const checkLikeQuery = "SELECT * FROM likes WHERE user_id = ? AND post_id = ?";
    
    db.query(checkLikeQuery, [userId, postId], (err, results) => {
        if (err) throw err;

        // If the user has liked the post, remove the like (unlike)
        if (results.length > 0) {
            const unlikeQuery = "DELETE FROM likes WHERE user_id = ? AND post_id = ?";
            db.query(unlikeQuery, [userId, postId], (err) => {
                if (err) throw err;

                // Optionally, retrieve the post along with the image URL after unliking
                const postQuery = `
                    SELECT posts.*, images.image_url
                    FROM posts
                    LEFT JOIN images ON posts.id = images.post_id
                    WHERE posts.id = ?`;

                db.query(postQuery, [postId], (err, post) => {
                    if (err) throw err;
                    res.json({ msg: "Post unliked", post: post[0], liked: false });
                });
            });
        } else {
            // If the user has not liked the post, add the like
            const likeQuery = "INSERT INTO likes (user_id, post_id) VALUES (?, ?)";
            db.query(likeQuery, [userId, postId], (err, result) => {
                if (err) throw err;

                // Optionally, retrieve the post along with the image URL after liking
                const postQuery = `
                    SELECT posts.*, images.image_url
                    FROM posts
                    LEFT JOIN images ON posts.id = images.post_id
                    WHERE posts.id = ?`;

                db.query(postQuery, [postId], (err, post) => {
                    if (err) throw err;
                    res.json({ msg: "Post liked", post: post[0], liked: true });
                });
            });
        }
    });
});


  
  // Follow a user
// Follow a user
router.post('/follow_user/:id', authMiddleware, (req, res) => {
    const userId = req.user.id;
    const followId = req.params.id;

    // Check if the user is already following
    const checkFollowQuery = "SELECT * FROM follows WHERE follower_id = ? AND following_id = ?";
    db.query(checkFollowQuery, [userId, followId], (err, result) => {
        if (err) return res.status(500).json({ msg: "Database error", error: err });

        if (result.length > 0) {
            // User is already following, perform unfollow (delete from follows)
            const unfollowQuery = "DELETE FROM follows WHERE follower_id = ? AND following_id = ?";
            db.query(unfollowQuery, [userId, followId], (err, result) => {
                if (err) return res.status(500).json({ msg: "Unfollow failed", error: err });
                return res.json({ msg: "User unfollowed" });
            });
        } else {
            // User is not following, perform follow (insert into follows)
            const followQuery = "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)";
            db.query(followQuery, [userId, followId], (err, result) => {
                if (err) return res.status(500).json({ msg: "Follow failed", error: err });

                // Optionally, retrieve the followed user's information including their image
                const userQuery = "SELECT * FROM users WHERE id = ?";
                db.query(userQuery, [followId], (err, user) => {
                    if (err) return res.status(500).json({ msg: "Failed to retrieve user data", error: err });
                    res.json({ msg: "User followed", user: user[0] }); // Include user data if necessary
                });
            });
        }
    });
});



  module.exports = router;
  