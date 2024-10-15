'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import Pagination from '@/app/components/Pagination';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { FaUserCheck, FaUserPlus } from 'react-icons/fa';
import Loader from '../components/Loader';

export default function FeedPage() {
    const [newPostContent, setNewPostContent] = useState('');
    const [image, setImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [Loading,setLoading] = useState(false)
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();
    const [loginUser, setLoginUser] = useState({});

    useEffect(() => {
        getAllPosts(currentPage);
        const findLoginUser = JSON.parse(localStorage.getItem('user'));
        setLoginUser(findLoginUser);
    }, [currentPage]);

    const getAllPosts = async (page) => {
        const authToken = Cookies.get('token');

        try {
            const res = await axios.get(`${apiBaseUrl}/post/get_all`, {
                params: { page },
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setPosts(res.data.posts);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Failed to fetch posts', error);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        setLoading(true)
        let imageUrl = '';

        if (image) {
            const formData = new FormData();
            formData.append('file', image);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);

            try {
                const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) throw new Error('Image upload failed');

                const data = await res.json();
                imageUrl = data.secure_url;
            } catch (err) {
                console.error('Image upload failed:', err);
                return;
            }
        }

        const data = { content: newPostContent, imageUrl };
        const authToken = Cookies.get('token');

        try {
            await axios.post(`${apiBaseUrl}/post/create_post`, data, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            setNewPostContent('');
            setImage(null);
            setIsModalOpen(false);
            getAllPosts(currentPage);
        } catch (error) {
            console.error('Failed to create post', error);
        }finally{
            setLoading(false)
        }
    };

    const handleLike = async (postId) => {
        const authToken = Cookies.get('token');

        try {
            await axios.post(`${apiBaseUrl}/post/like_post/${postId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            getAllPosts(currentPage);
        } catch (error) {
            console.error('Failed to like post', error);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleFollow = async (user_id) => {
        const authToken = Cookies.get('token');

        try {
            await axios.post(`${apiBaseUrl}/post/follow_user/${user_id}`, {}, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            getAllPosts(currentPage);
        } catch (error) {
            console.error('Failed to like post', error);
        }
    };

    const handleLogout = () => {
        Cookies.remove('token');
        router.push('/auth/login');
    };

    return (
        <div className="bg-gray-100 h-screen flex flex-col p-4">
            <div className="flex justify-between sticky top-0 z-10 bg-gray-100 py-2">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="py-2 px-4 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-200"
                >
                    Create Post
                </button>
                <button className='py-2 px-4 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-200' onClick={handleLogout}>Logout</button>
            </div>

            <div className="w-[80%] m-auto max-w-md bg-white rounded-lg shadow-md flex-grow overflow-y-auto">
                {posts?.map((post) => (
                    <div key={post.id} className="p-4 border-b last:border-b-0">
                        <Link href={`/post/${post.id}`}>
                            <p className="mb-2">{post.content}</p>
                            {post.image_url && <img src={post.image_url} alt="Post" className="mb-2 rounded-md" />}
                        </Link>

                        <div className="flex justify-between items-center">
                            <button onClick={() => handleLike(post.id)} className="text-blue-500">
                                {post.likePost ? <AiFillLike /> : <AiOutlineLike />}
                            </button>
                            <button
                                disabled={post.user_id === loginUser.id}
                                onClick={() => handleFollow(post.user_id)}
                                className={`flex items-center mt-4 ml-4 transition-colors duration-200
                                ${post.isFollowed ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}
                                text-white rounded-md px-1.5 py-0.5 text-sm ${post.user_id === loginUser.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {post.isFollow == 0 ? <FaUserCheck className="mr-1" /> : <FaUserPlus className="mr-1" />}
                                {post.isFollow == 1 ? <span>Unfollow</span> : <span>Follow</span>}
                            </button>
                        </div>
                        <span>{post.totalLikes}</span>
                    </div>
                ))}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

{isModalOpen && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md relative">
            {Loading && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
                    <Loader /> 
                </div>
            )}
            <h2 className="mb-4 text-xl font-semibold">Create a New Post</h2>
            <form onSubmit={handleCreatePost}>
                <textarea
                    rows="3"
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    required
                    className="w-full p-2 border rounded-md mb-4"
                    disabled={Loading} // Disable while loading
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="mb-4"
                    disabled={Loading} // Disable while loading
                />
                <div className="flex justify-between">
                    <button
                        type="submit"
                        className="py-2 px-4 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-200"
                        disabled={Loading} // Disable button while loading
                    >
                        {Loading ? 'Creating...' : 'Create Post'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="py-2 px-4 font-semibold bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
                        disabled={Loading} // Disable cancel button while loading
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
)}

        </div>
    );
}
