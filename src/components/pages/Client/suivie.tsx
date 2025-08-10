import { Link, useNavigate } from "react-router-dom";
import illustration from "../../../assets/suivie.png";
import { useCandidates } from "../../../contexts/CandidatesContext";
import { getAuth } from "firebase/auth";

const Suivie: React.FC = () => {
  const navigate = useNavigate();
  const { candidates } = useCandidates();
  const auth = getAuth();

  const currentUserId = auth.currentUser?.uid;
  const isApproved = !!currentUserId && candidates.some(
    (c) => c.userId === currentUserId && c.status === "Approved"
  );

  const handleLogout = () => {
    alert("Logout successfully");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-60 bg-gray-50 p-6 border-r relative">
        <h2 className="text-blue-600 font-bold text-2xl">ProxymHR</h2>
        <nav className="mt-10 space-y-4">
          <div className="font-semibold text-black">
            <Link to="/client" className="hover:underline">
              Profile
            </Link>
          </div>
          <div className="text-gray-600 hover:text-blue-600 font-semibold">
            <Link to="/UploadCV" className="hover:underline">
              Upload CV
            </Link>
          </div>
          <div className="text-blue-600 font-semibold underline">Suivie</div>
        </nav>
        <button
          onClick={handleLogout}
          className="hover:underline text-red-500 absolute bottom-6 left-6"
        >
          Log Out
        </button>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-gray-700 text-sm font-medium pb-4 border-b">
          {isApproved ? "CV Approved" : "CV Status"}
        </h1>

        <section className="mt-10">
          {isApproved ? (
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
              <img
                src={illustration}
                alt="Working illustration"
                className="w-[420px] h-[420px] object-contain"
              />

              <div className="max-w-2xl text-[13px] text-black leading-6">
                <p className="mb-3">Dear Candidate,</p>
                <p className="mb-2">
                  We are pleased to inform you that your resume has been successfully
                  reviewed and approved by our recruitment team for the position of
                  Trainee at Proxym.
                </p>
                <p className="mb-2">
                  Your qualifications and experience align well with what we're
                  looking for, and we are excited to move forward with the next
                  steps of the selection process.
                </p>
                <p className="mb-2">
                  Our HR team will contact you shortly to schedule an interview and
                  provide further details.
                </p>
                <p className="mb-2">
                  If you have any questions in the meantime, feel free to reach out
                  to us at rh@proxym-it.com.
                </p>
                <p className="mb-2">
                  Thank you for your interest in joining Proxym. We look forward to
                  speaking with you soon!
                </p>
                <p className="mt-6">Best regards,</p>
                <p>Bouzablaa Rayen</p>
                <p>HR Department</p>
                <p>Proxy-Group</p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl text-[13px] text-black leading-6">
              <p className="mb-2">
                Your CV is currently under review. Once it is approved by our HR team,
                this page will display your approval confirmation and next steps.
              </p>
              <p className="text-gray-500">Please check back later.</p>
            </div>
          )}

          <div className="mt-10 flex justify-end">
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Return
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Suivie;