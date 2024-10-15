'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { AiOutlineLike, AiFillLike } from 'react-icons/ai';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';
import Cookies from 'js-cookie';

export default function PostPage() {
  const router = useRouter();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [loginUser, setLoginUser] = useState({});

  useEffect(() => {

    if (id) {
      fetchPost();
      const findLoginUser = JSON.parse(localStorage.getItem('user'));
      setLoginUser(findLoginUser);
    }
  }, [id]);


  const fetchPost = async () => {
    const authToken = Cookies.get('token');

    try {
      const res = await axios.get(`${apiBaseUrl}/post/single_post/${id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (res) {
        setPost(res.data);
        setIsLiked(res.data.likePost); 
        setIsFollowed(res.data.isFollow); 
      } else {
        alert('Failed to fetch post');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      alert('Failed to fetch post');
    }
  };

  // Handle like functionality
  const handleLike = async () => {
    const authToken = Cookies.get('token');

    try {
      await axios.post(`${apiBaseUrl}/post/like_post/${id}`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });

      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Error liking post:', err);
      alert('Failed to like post');
    }
  };

  // Handle follow functionality
  const handleFollow = async () => {
    const authToken = Cookies.get('token');
    try {
      await axios.post(`${apiBaseUrl}/post/follow_user/${post.user_id}`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });
      await fetchPost()
      setIsFollowed(!isFollowed);
    } catch (err) {
      console.error('Error following user:', err);
      alert('Failed to follow user');
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-semibold mb-4">{post.title}</h1>
      <p className="mb-4 text-lg text-gray-700">{post.content}</p>

      {post.images.length > 0 && (
        <img
          src={post.images[0]}
          alt="Post Image"
          className="w-full h-auto rounded-lg mb-4"
        />
      )}

      <button
        onClick={handleLike}
        className={`flex items-center mt-4 transition-colors duration-200 
          ${isLiked ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}>
        {isLiked ? <AiFillLike className="mr-1 text-xl" /> : <AiOutlineLike className="mr-1 text-xl" />}
        {isLiked ? 'Unlike' : 'Like'}
      </button>



      <button
        disabled={post.user_id === loginUser.id}
        onClick={handleFollow}
        className={`flex items-center mt-4 ml-4 transition-colors duration-200
                                ${post.isFollowed ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}
                                text-white rounded-md px-1.5 py-0.5 text-sm ${post.user_id === loginUser.id ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {post.isFollow == 0 ? <FaUserCheck className="mr-1" /> : <FaUserPlus className="mr-1" />}
        {post.isFollow == 1 ? <span>Unfollow</span> : <span>Follow</span>}
      </button>
    </div>
  );
}
