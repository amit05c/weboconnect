import { useState } from 'react';

const useApi = (url, method = 'GET') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const sendData = async (body = {}) => {
    setLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method !== 'GET' ? JSON.stringify(body) : null,
      });
     
      if (response.status == 400) {
        const responseData = await response.json();
        throw new Error(responseData.msg);
      }
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }
      
      const responseData = await response.json();
      setData(responseData);
      setIsSuccess(true);
      return responseData
    } catch (err) {

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { sendData, loading, error, data, isSuccess };
};

export default useApi;
