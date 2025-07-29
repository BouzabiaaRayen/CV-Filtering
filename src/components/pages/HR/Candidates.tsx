import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhone, FaEye } from "react-icons/fa";
import { useCandidates } from "../../../contexts/CandidatesContext";

const filterOptions = {
  degree: ["Engineering", "Business", "Arts"],
  experience: ["1 year", "2 years", "3 years", "5+ years"],
  technicalSkills: ["Frameworks", "Languages", "Tools"],
  previousJob: ["Engineer", "Designer", "Developer"],
  certifications: ["Google cloud", "AWS", "Azure"],
};

const Candidates = () => {
  const navigate = useNavigate();
  const { candidates } = useCandidates();

  const [filters, setFilters] = useState({
    degree: "Engineering",
    experience: "2 years",
    technicalSkills: "Frameworks",
    previousJob: "Engineer",
    certifications: "Google cloud",
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const HandleLogout = () => {
    alert("logout successfully");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-60 bg-gray-50 p-6 border-r flex flex-col">
        <h2 className="text-blue-600 font-bold text-2xl">ProxymHR</h2>
        <nav className="mt-10 space-y-4 flex-grow">
          <div className="font-semibold text-black">
            <Link to="/HRinterface" className="hover:underline">
              Profile
            </Link>
          </div>
          <div className="text-gray-600">
            <Link to="/Candidates" className="font-semibold hover:underline">
              Candidates
            </Link>
          </div>
        </nav>
        <button
          onClick={HandleLogout}
          className="hover:underline text-red-500 mt-20"
        >
          Log Out
        </button>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-xl font-semibold mb-6">Candidates</h1>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <select
            name="degree"
            value={filters.degree}
            onChange={handleFilterChange}
            className="border rounded px-3 py-1"
          >
            {filterOptions.degree.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            name="experience"
            value={filters.experience}
            onChange={handleFilterChange}
            className="border rounded px-3 py-1"
          >
            {filterOptions.experience.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            name="technicalSkills"
            value={filters.technicalSkills}
            onChange={handleFilterChange}
            className="border rounded px-3 py-1"
          >
            {filterOptions.technicalSkills.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            name="previousJob"
            value={filters.previousJob}
            onChange={handleFilterChange}
            className="border rounded px-3 py-1"
          >
            {filterOptions.previousJob.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            name="certifications"
            value={filters.certifications}
            onChange={handleFilterChange}
            className="border rounded px-3 py-1"
          >
            {filterOptions.certifications.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Candidates Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b border-gray-300">
              <th className="pb-2">Name</th>
              <th className="pb-2">Department</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Contacts</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate: any) => (
              <tr
                key={candidate.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 flex items-center space-x-3">
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold">{candidate.name}</div>
                    <div className="text-gray-500 text-sm">{candidate.role}</div>
                  </div>
                </td>
                <td className="py-3">{candidate.department}</td>
                <td className="py-3">
                  <span className="bg-pink-300 text-pink-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {candidate.status}
                  </span>
                </td>
                <td className="py-3 space-y-1 text-gray-600 text-sm">
                  <div className="flex items-center space-x-2">
                    <FaEnvelope />
                    <a href={`mailto:${candidate.email}`} className="hover:underline">
                      {candidate.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaPhone />
                    <a href={`tel:${candidate.phone}`} className="hover:underline">
                      {candidate.phone}
                    </a>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <button className="text-gray-400 hover:text-gray-600">
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-end mt-6">
          <select className="border rounded px-3 py-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
          <span className="ml-2 mt-1 text-gray-600">of 10</span>
        </div>
      </main>
    </div>
  );
};

export default Candidates;
