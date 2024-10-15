'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useApi from '@/app/hooks/useFetch';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const router = useRouter();

  const { sendData, loading, error, isSuccess } = useApi(`/users/register`, 'POST');

 
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setValidationError(''); 

    // Email and password validation
    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    
    const body = { username: email, email, password };
    
   const res= await sendData(body);

    if (res) {
      alert('Registration successful');
      router.push('/auth/login');
    } else if (error) {
      alert('Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-semibold text-center text-gray-700">Register</h1>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
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
          </div>

          {validationError && (
            <p className="mb-4 text-red-500 text-center">{validationError}</p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-2 font-semibold text-white rounded-md 
              ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} 
              focus:outline-none focus:ring focus:ring-blue-300 transition duration-200`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {error && <p className="mt-4 text-red-500 text-center">Error: {error}</p>}
        
        <p className="mt-4 text-center text-gray-600">
          Already have an account? <a href="/auth/login" className="text-blue-500 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}
