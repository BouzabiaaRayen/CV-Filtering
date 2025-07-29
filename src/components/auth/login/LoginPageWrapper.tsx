
import LoginPage from './LoginPage';
import { Link, NavLink } from 'react-router-dom';

export default function LoginPageWrapper() {
  return (
    <>
      <LoginPage />
      <div className="mt-4 text-center">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </div>
    </>
  );
}
