'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useApi from '@/app/hooks/useFetch';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  const { sendData, data, loading, error, isSuccess } = useApi('/users/login', 'POST');

  // Helper function for validating email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Email and password validation
    let valid = true;
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      valid = false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      valid = false;
    }

    if (!valid) {
      return;
    }

    const body = { email, password };
    const res = await sendData(body);

    if (res.token) {
      Cookies.set('token', res.token, { expires: 1 });
      localStorage.setItem('user', JSON.stringify(res.user));
      router.push('/feed');
    } else if (error) {
      alert('Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-semibold text-center text-gray-700">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-2 font-semibold text-white rounded-md 
              ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} 
              focus:outline-none focus:ring focus:ring-blue-300 transition duration-200`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-center">Error: {error}</p>}
        <p className="mt-4 text-center text-gray-600">
          Don't have an account? <a href="/auth/register" className="text-blue-500 hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
}
