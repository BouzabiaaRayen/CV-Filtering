// App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPageWrapper from './components/auth/login/LoginPageWrapper';
import SignupPageWrapper from './components/auth/signup/SignupPageWrapper';
import ClientInterface from './components/pages/Client/Clientinterface';
import HrInterface from './components/pages/HR/HRinterface';
import Candidates from './components/pages/HR/Candidates';
import Suivie from './components/pages/Client/suivie';
import UploadCV from './components/pages/Client/UploadCV';
import { CandidatesProvider } from './contexts/CandidatesContext';

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="flex flex-col justify-center items-center w-3/5 bg-gradient-to-b from-blue-600 to-blue-400 text-white p-12">
        <h1 className="text-4xl font-bold mb-4">ProxymHR</h1>
        <p className="text-sm max-w-xs text-center">
          "HR Without the Headache – Everything You Need in One Platform."
        </p>
      </div>

      <div className="flex flex-col justify-center w-2/5 p-8">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
export default function App() {
  return (
    <CandidatesProvider>
      <Routes>
        <Route
          path="/login" 
          element={
            <AuthLayout>
              <LoginPageWrapper />
            </AuthLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthLayout>
              <SignupPageWrapper />
            </AuthLayout>
          }
        />
        {/* redirect lel client */}
        <Route path="/client" element={<ClientInterface />} />
        <Route path='/candidates' element={<Candidates/>}/>
        <Route  path='/HRinterface' element={<HrInterface />}/>
        <Route path='/UploadCV' element={<UploadCV/>} />
        <Route path='/suivie' element={<Suivie/>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </CandidatesProvider>
  );
}
