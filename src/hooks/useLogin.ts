import  {useEffect} from 'react';
import { useState } from "react";
import { getIdToken } from 'firebase/auth';


const useLogin = () =>{

    const userType = localStorage.getItem('userType');
    const [loading, setLoading] = useState(true);
    const  useEffect=() => {
        const checkLogin = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                const token = user ? await getIdToken(user) : null;
                if (!token) {
                    window.location.href = '/login';
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error checking login:', error);
                window.location.href = '/login';
            }
        };

        checkLogin();
     if (userType === 'HR') {
         window.location.href = '/HRinterface';   
     } else if (userType === 'Client') {
         window.location.href = '/client';
     } else {
         window.location.href = '/login';

    return null; 
     }
    }
};

export default useLogin;

    