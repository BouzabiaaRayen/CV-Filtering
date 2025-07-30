import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveHRData, uploadProfileImage, getHRData } from "../../firebase/database";
import { getAuth, signOut } from "firebase/auth";

const HrInterface = () => {
    const navigate = useNavigate();
    const auth = getAuth();

    // Form states
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [tempsService, setTempsService] = useState('');
    const [job, setJob] = useState('');
    const [department, setDepartment] = useState('');

    // UI states
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load existing HR data on component mount
    useEffect(() => {
        const loadHRData = async () => {
            if (!auth.currentUser) {
                navigate("/login");
                return;
            }

            setError('');

            try {
                const result = await getHRData();
                if (result.success && result.data) {
                    const data = result.data;
                    setFullName(data.fullName || '');
                    setEmail(data.email || '');
                    setGender(data.gender || '');
                    setDateOfBirth(data.dateOfBirth || '');
                    setProfileImageUrl(data.profileImageUrl || '');
                    setTempsService(data.tempsService || '');
                    setJob(data.job || '');
                    setDepartment(data.department || '');
                }
            } catch (err) {
                setError('Failed to load profile data');
                console.error('Error loading HR data:', err);
            }
        };

        loadHRData();
    }, [auth.currentUser, navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Error signing out:", error);
            setError("Failed to log out");
        }
    };

    const handleSave = async () => {
        if (!auth.currentUser) {
            setError("You must be logged in to save changes");
            return;
        }

        // Basic validation
        if (!fullName.trim() || !email.trim()) {
            setError("Full name and email are required");
            return;
        }

        setError('');
        setSuccess('');

        try {
            let imageUrl = profileImageUrl;

            // Upload new profile image if selected
            if (profileImage) {
                try {
                    imageUrl = await uploadProfileImage(profileImage, auth.currentUser.uid);
                    setProfileImageUrl(imageUrl);
                } catch (uploadError) {
                    console.error("Error uploading image:", uploadError);
                    setError("Failed to upload profile image");
                    return;
                }
            }

            // Save HR data
            const hrData = {
                fullName: fullName.trim(),
                email: email.trim(),
                gender,
                dateOfBirth,
                profileImageUrl: imageUrl,
                tempsService: tempsService.trim(),
                job: job.trim(),
                department
            };

            const result = await saveHRData(hrData);

            if (result.success) {
                setSuccess("Profile saved successfully!");
                setProfileImage(null); // Clear the selected file
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.message || "Failed to save profile");
            }
        } catch (err) {
            console.error("Error saving HR data:", err);
            setError("An unexpected error occurred while saving");
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Validate file size (500KB = 500 * 1024 bytes)
            if (file.size > 500 * 1024) {
                setError("Image size must be less than 500KB");
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError("Please select a valid image file");
                return;
            }

            setProfileImage(file);
            setError('');
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            <aside className="w-60 bg-gray-50 p-6 border-r flex flex-col">
                <h2 className="text-blue-600 font-bold text-2xl">ProxymHR</h2>
                <nav className="mt-10 space-y-4 flex-grow">
                    <div className="font-semibold text-black">Profile</div>
                    <div className="text-gray-600">
                        <Link to="/Candidates" className="font-semibold hover:underline">
                            Candidates
                        </Link>
                    </div>
                </nav>
                <button 
                    onClick={handleLogout} 
                    className="hover:underline text-red-500 mt-20"
                >
                    Log Out
                </button>
            </aside>

            <main className="flex-1 p-10">
                <h1 className="text-2xl font-bold mb-6 mt-8 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-400 transition">
                    My Profile
                </h1>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        {success}
                    </div>
                )}

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>
                    <div className="flex items-center gap-4">
                        <img
                            src={
                                profileImage
                                    ? URL.createObjectURL(profileImage)
                                    : profileImageUrl || "https://via.placeholder.com/100"
                            }
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
                    <div>
                        <label className="block mb-1 font-medium">Full Name *</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Email *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Gender</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Date of Birth</label>
                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Years of Service</label>
                        <input
                            type="text"
                            value={tempsService}
                            onChange={(e) => setTempsService(e.target.value)}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 5 years"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Job Title</label>
                        <input
                            type="text"
                            value={job}
                            onChange={(e) => setJob(e.target.value)}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., HR Manager"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Department</label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select</option>
                            <option value="Dev-Ops">Dev-Ops</option>
                            <option value="Software Engineer">Software Engineer</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Human Resources">Human Resources</option>
                            <option value="Finance">Finance</option>
                            <option value="Sales">Sales</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="mt-8 px-6 py-2 rounded transition bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Save Changes
                </button>
            </main>
        </div>
    );
};

export default HrInterface;

