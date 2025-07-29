import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase/firebase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [userType, setUserType] = useState<'Client' | 'HR'>('Client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('Login successful:', user);
        localStorage.setItem('userType', userType);
        localStorage.setItem('user', JSON.stringify(user));
        if (userType === 'Client') {
          navigate('/client');
        } else if (userType === 'HR') {
          navigate('/HRinterface');
        }
      })
      .catch((error) => {
        console.error('Login failed:', error);
      });
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-2">Hello!</h1>
      <p className="text-gray-600 mb-6">Sign Up to Get Started</p>
      <div className="flex mb-6">
        <button
          type="button"
          className={`flex-1 py-2 rounded-l-lg border border-gray-300 text-center font-semibold ${
            userType === 'Client' ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setUserType('Client')}
        >
          Client
        </button>
        <button
          type="button"
          className={`flex-1 py-2 rounded-r-lg border border-gray-300 text-center font-semibold ${
            userType === 'HR' ? 'bg-gray-400 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setUserType('HR')}
        >
          HR
        </button>
      </div>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
        >
          Login
        </button>
      </form>
      
    </div>
  );
}
