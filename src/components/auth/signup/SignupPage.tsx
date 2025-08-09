import { useState } from 'react'
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase/firebase';
import { saveUserType } from '../../firebase/database';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const [userType, setUserType] = useState<'Client' | 'HR'>('Client')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Signup successful:', user);
      console.log('User ID:', user.uid);
      
      // Save user type to database
      const userTypeResult = await saveUserType(user.uid, userType, email);
      if (!userTypeResult.success) {
        throw new Error(userTypeResult.message || 'Failed to save user type');
      }
      
      // Wait a moment for authentication to fully propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify user is still authenticated
      if (auth.currentUser) {
        localStorage.setItem('userType', userType);
        localStorage.setItem('user', JSON.stringify(user));
        
        if (userType === 'Client') {
          navigate('/client');
        } else if (userType === 'HR') {
          navigate('/HRinterface');
        }
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      setError(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center w-full max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-1">Hello!</h1>
      <p className="text-gray-500 mb-6">Sign Up to Get Started</p>

      <div className="flex space-x-4 mb-6">
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
            userType === 'Client' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => setUserType('Client')}
        >
          Client
        </button>
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
            userType === 'HR' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => setUserType('HR')}
        >
          HR
        </button>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}