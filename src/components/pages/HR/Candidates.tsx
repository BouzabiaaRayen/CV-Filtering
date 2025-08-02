import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useCandidates, Candidate } from "../../../contexts/CandidatesContext";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../../firebase/firebase";

const filterOptions = {
  degree: ["All", "Engineering", "Business", "Arts", "Design"],
  experience: ["All", "1 year", "2 years", "3 years", "5+ years"],
  technicalSkills: ["All", "Frameworks", "Languages", "Tools"],
  previousJob: ["All", "Engineer", "Designer", "Developer"],
  certifications: ["All", "Google cloud", "AWS", "Azure"],
};

const initialFilters = {
  degree: "All",
  experience: "All",
  technicalSkills: "All",
  previousJob: "All",
  certifications: "All",
};

export default function Candidates() {
  const navigate = useNavigate();
  const { candidates } = useCandidates();

  const [filters, setFilters] = useState(initialFilters);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [candidateStatusMap, setCandidateStatusMap] = useState<{ [id: string]: string }>({});
  const [imageURLs, setImageURLs] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const urlEntries = await Promise.all(
          candidates.map(async (candidate) => {
            if (candidate.avatar) {
              const imageRef = ref(storage, `avatars/${candidate.avatar}`);
              const url = await getDownloadURL(imageRef);
              return [candidate.id, url] as const;
            }
            return null;
          })
        );

        const urls = Object.fromEntries(urlEntries.filter(Boolean) as [string, string][]);
        setImageURLs(urls);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    if (candidates.length > 0) {
      fetchImages();
    }
  }, [candidates]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedRows);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedRows(newSet);
  };

  const handleApprove = (id: string) => {
    setCandidateStatusMap((prev) => ({ ...prev, [id]: "Approved" }));
  };

  const matchesFilter = (candidate: Candidate) => {
    return (
      (filters.degree === "All" || candidate.education?.includes(filters.degree)) &&
      (filters.experience === "All" || candidate.experience?.includes(filters.experience)) &&
      (filters.technicalSkills === "All" ||
        candidate.skills?.some((s) =>
          s.toLowerCase().includes(filters.technicalSkills.toLowerCase())
        )) &&
      (filters.previousJob === "All" || candidate.role?.includes(filters.previousJob)) &&
      (filters.certifications === "All" ||
        candidate.rawText?.toLowerCase().includes(filters.certifications.toLowerCase()))
    );
  };

  const HandleLogout = () => {
    alert("Logout successful");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-50 p-6 border-r flex flex-col">
        <h2 className="text-blue-600 font-bold text-2xl">ProxymHR</h2>
        <nav className="mt-10 space-y-4 flex flex-col gap-4 flex-grow">
          <Link to="/HRinterface" className="hover:underline font-semibold text-black">
            Profile
          </Link>
          <Link to="/Candidates" className="hover:underline font-semibold text-gray-600">
            Candidates
          </Link>
        </nav>
        <button onClick={HandleLogout} className="hover:underline text-red-500 mt-20">
          Log Out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <h1 className="text-xl font-semibold mb-6">Candidates</h1>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-6 mb-6">
          {Object.entries(filterOptions).map(([key, options]) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm text-gray-500 font-medium capitalize mb-1">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              <select
                name={key}
                value={(filters as any)[key]}
                onChange={handleFilterChange}
                className="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Reset Filters Button */}
          <button
            onClick={resetFilters}
            className="mt-5 text-sm px-4 py-2 rounded-full bg-gray-100 border hover:bg-gray-200 text-gray-700"
          >
            Reset Filters
          </button>
        </div>

        {/* Candidates list */}
        {candidates.filter(matchesFilter).length === 0 ? (
          <p className="text-gray-500">No candidates match the filters.</p>
        ) : (
          <div className="space-y-4">
            {candidates.filter(matchesFilter).map((candidate) => (
              <div key={candidate.id} className="border rounded-lg p-4 hover:shadow transition">
                <div className="flex justify-between items-center">
                  {/* Avatar, Name, Role */}
                  <div className="flex items-center gap-4">
                    <img
                      src={imageURLs[candidate.id] || "/fallback-avatar.png"}
                      alt={candidate.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/fallback-avatar.png";
                      }}
                    />
                    <div>
                      <p className="font-semibold">{candidate.name}</p>
                      <p className="text-sm text-gray-500">{candidate.role}</p>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="text-gray-700 w-[200px]">{candidate.department}</div>

                  {/* Status */}
                  <div className="w-[150px]">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        (candidateStatusMap[candidate.id] || candidate.status) === "Approved"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {candidateStatusMap[candidate.id] || candidate.status}
                    </span>
                  </div>

                  {/* Contact */}
                  <div className="w-[300px] text-sm text-gray-800">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <a href={`mailto:${candidate.email}`} className="hover:underline">
                        {candidate.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone size={16} className="text-gray-500" />
                      <a href={`tel:${candidate.phone}`} className="hover:underline">
                        {candidate.phone}
                      </a>
                    </div>
                  </div>

                  {/* Expand button */}
                  <button
                    onClick={() => toggleExpand(candidate.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedRows.has(candidate.id) ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>

                {/* Expanded details */}
                {expandedRows.has(candidate.id) && (
                  <div className="mt-4 bg-gray-50 p-4 rounded text-sm text-gray-700 space-y-2">
                    <div><strong>Skills:</strong> {candidate.skills?.join(", ") || "N/A"}</div>
                    <div><strong>Experience:</strong> {candidate.experience || "N/A"}</div>
                    <div><strong>Education:</strong> {candidate.education || "N/A"}</div>
                    <div>
                      <strong>Actions:</strong>{" "}
                      {candidateStatusMap[candidate.id] === "Approved" ? (
                        <span className="text-green-600 font-semibold ml-2">✅ Approved</span>
                      ) : (
                        <button
                          onClick={() => handleApprove(candidate.id)}
                          className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200"
                        >
                          ✅ Approve
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination (static) */}
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
}
