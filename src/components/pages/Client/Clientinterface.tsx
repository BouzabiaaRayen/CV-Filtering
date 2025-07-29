import { useState } from "react";
import { Link ,Navigate,useNavigate} from "react-router-dom";


const ClientInterface = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('rayenbouzabiaaa@gmail.com');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const navigate = useNavigate();



  type Props = { children?: React.ReactNode };

  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleLogout = () => {
    const navigate = useNavigate();
    alert("Logged out!");
    navigate("/login");
  };

  const handleSave = () => {
    alert("Profile saved!");
  };

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-60 bg-gray-50 p-6 border-r">
        <h2 className="text-2xl font-bold text-blue-600">ProxymHR</h2>
        <nav className="mt-10 space-y-4">
          <div className="font-semibold text-black">Profile</div>
          <div className="text-gray-600"><Link to='/UploadCV' className="hover:underline font-semibold hover:text-blue-600">Upload CV</Link></div>
          <div className="text-gray-600"><Link to='/suivie' className="hover:underline font-semibold hover:text-blue-600">Suivie</Link></div>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-20 text-red-500 font-semibold hover:underline position: absolute bottom-6 left-6"
        >
          Log out
        </button>
      </aside>

      
      <main className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-6  mt-8 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-400 transition ">My Profile</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>
          <div className="flex items-center gap-4">
            <img
              src={
                profileImage
                  ? URL.createObjectURL(profileImage)
                  : "https://via.placeholder.com/100"
              }
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block"
              />
              <p className="text-sm text-gray-400">JPG or PNG Max Size of 500KB</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl">
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border bg-white-100 rounded px-3 py-2 "
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-8 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </main>
    </div>
  );
};

export default ClientInterface;
