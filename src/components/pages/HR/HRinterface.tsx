import { useState } from "react";
import { Link, Navigate, NavLink, useNavigate } from "react-router-dom";
import Candidates from './Candidates';

const HrInterface = () => {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [TempsService , setTempsServices] = useState('');
    const [job , setJob] = useState('');
    const [depart , setDepart] = useState("");


    type Props = { children?: React.ReactNode };


const HandleLogout = () =>{
    alert("logged out ");
    navigate("/login");
}

const HandleSave = () => {
    alert("saved succesfully");
    
}
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };


return (
    <div className="flex min-h-screen bg-white">
        <aside className="w-60 bg-gray-50 p-6 border-r">
            <h2 className=" text-blue-600 font-bold text-2xl  ">ProxymHR</h2>
            <nav className="mt-10 space-y-4">
                <div className="font-semibold text-black">Profile</div>
                <div className="text-gray-600 "><Link to="/Candidates" className="font-semibold hover:underline">Candidates</Link></div>
            </nav>
            <button onClick={HandleLogout} className="hover:underline text-red-500 mt-20 position: absolute bottom-6 left">Log Out</button>
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

        <div className="grid grid-cols-4 md:grid-cols-4 gap-6 max-w-l">
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
          <div >
            <label className="block mb-1 font-medium gap-6">Temps services </label>
            <input 
                type="text"
                value={TempsService}
                onChange={(e)=> setTempsServices(e.target.value)}
                className="w-full border rounded px-3 py-2" />
          </div>
          <div >
            <label className="block mb-1 font-medium">Job </label>
            <input
                type="text"
                value={job}
                onChange={(e)=>setJob(e.target.value)}
                className="w-full border rounded px-3 py-2"
            />

          </div>
          <div>
            <label className="block mb-1 font-medium">Department</label>
            <select 
                value={depart}
                onChange={(e)=>setDepart(e.target.value)}
                className="w-full border rounded px-3 py-2"
            >
                <option value={depart}>Select</option>
                <option>Dev-Ops</option>
                <option>Software Engineer</option>
                <option>Marketing   </option>
            </select>
          </div>
        </div>
        

        <button
          onClick={HandleSave}
          className="mt-8 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </main>
    </div>
  );
};

export default HrInterface;

