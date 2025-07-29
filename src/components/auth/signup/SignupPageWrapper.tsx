
import SignupPage from './SignupPage';
import { Link } from 'react-router-dom';

 function SignupPageWrapper() {
  return (
    <>
      <SignupPage />
      <div className="mt-4 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </div>
    </>
  );
}
 export default SignupPageWrapper;