// Create a new post
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const { createPost, getALLPosts, getSinglePost, postLike, followPost } = require('../controllers/postController');

router.post('/create_post', authMiddleware, createPost);

  // Retrieve all posts (with pagination)
 // Retrieve all posts (with pagination)
 router.get('/get_all', authMiddleware, getALLPosts);






router.get('/single_post/:id', authMiddleware, getSinglePost);




  
  // Like a post
// Like a post
router.post('/like_post/:id', authMiddleware, postLike);


  
  // Follow a user
// Follow a user
router.post('/follow_user/:id', authMiddleware, followPost);



  module.exports = router;
  