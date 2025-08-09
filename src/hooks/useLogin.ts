import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getUserType } from '../components/firebase/database';

const useLogin = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          window.location.href = '/login';
          return;
        }

        // Check user type from database
        const userTypeResult = await getUserType(user.uid);
        if (userTypeResult.success && userTypeResult.data) {
          const userType = userTypeResult.data.userType;
          localStorage.setItem('userType', userType);
          localStorage.setItem('user', JSON.stringify(user));
          
          if (userType === 'HR') {
            window.location.href = '/HRinterface';
          } else if (userType === 'Client') {
            window.location.href = '/client';
          } else {
            window.location.href = '/login';
          }
        } else {
          // Fallback to localStorage if database check fails
          const userType = localStorage.getItem('userType');
          if (userType === 'HR') {
            window.location.href = '/HRinterface';
          } else if (userType === 'Client') {
            window.location.href = '/client';
          } else {
            window.location.href = '/login';
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking login:', error);
        window.location.href = '/login';
      }
    });

    return () => unsubscribe();
  }, []);

  return { loading };
};

export default useLogin;

    