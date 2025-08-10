import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, ChevronUp, ChevronDown, Search as SearchIcon } from "lucide-react";
import { useCandidates, Candidate } from "../../../contexts/CandidatesContext";
import { getUserProfileImage } from "../../firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

type FiltersState = {
  degree: string; // from education
  experience: string; // presets like 1,2,3,5+
  role: string;
  department: string;
  status: string;
  technicalSkills: string[];
  certifications: string[];
  search: string;
};

export default function Candidates() {
  const navigate = useNavigate();
  const { candidates, updateCandidate } = useCandidates();

  const [filters, setFilters] = useState<FiltersState>({
    degree: "All",
    experience: "All",
    role: "All",
    department: "All",
    status: "All",
    technicalSkills: [],
    certifications: [],
    search: "",
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [candidateStatusMap, setCandidateStatusMap] = useState<{ [id: string]: string }>({});
  const [imageURLs, setImageURLs] = useState<{ [id: string]: string }>({});
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const [retryCount, setRetryCount] = useState<{ [id: string]: number }>({});

  // Debug logging
  useEffect(() => {
    console.log("Candidates component: Candidates loaded:", candidates.length);
    console.log("Candidates component: Candidates data:", candidates);
  }, [candidates]);

  // Helper function to validate image URL
  const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
      // Check if URL is valid
      if (!url || !url.startsWith('http')) {
        return false;
      }

      // Skip validation for known good URLs (Firebase Storage URLs)
      if (url.includes('firebasestorage.googleapis.com') || url.includes('firebaseapp.com')) {
        return true;
      }

      // Create a timeout promise
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000); // 5 second timeout
      });

      // Try to fetch the image to see if it exists
      const fetchPromise = fetch(url, { method: 'HEAD' })
        .then(response => response.ok)
        .catch(() => false);

      // Race between fetch and timeout
      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (error) {
      console.error("Error validating image URL:", url, error);
      return false;
    }
  };

  // Helper function to retry image loading
  const retryImageLoad = async (candidateId: string) => {
    const currentRetries = retryCount[candidateId] || 0;
    if (currentRetries >= 2) {
      console.log(`Max retries reached for candidate ${candidateId}`);
      return;
    }

    setRetryCount(prev => ({ ...prev, [candidateId]: currentRetries + 1 }));
    console.log(`Retrying image load for candidate ${candidateId} (attempt ${currentRetries + 1})`);

    // Remove from errors to allow retry
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(candidateId);
      return newSet;
    });

    // Re-fetch the image
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
      // Re-trigger image fetch for this specific candidate
      setImageLoading(prev => new Set([...prev, candidateId]));
      
      // Simulate a small delay before retry
      setTimeout(() => {
        // This will trigger the useEffect to re-run for this candidate
        setImageURLs(prev => {
          const newUrls = { ...prev };
          delete newUrls[candidateId];
          return newUrls;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        console.log("Starting to fetch images for", candidates.length, "candidates");
        const urlEntries = await Promise.all(
          candidates.map(async (candidate) => {
            let imageUrl = null;
            console.log(`Processing candidate ${candidate.id} (${candidate.name}) with userId: ${candidate.userId}`);

            // Add to loading state
            setImageLoading(prev => new Set([...prev, candidate.id]));

            // Only use the user's profile image
            if (candidate.userId) {
              console.log(`No avatar found for candidate ${candidate.id}, trying user profile image for userId: ${candidate.userId}`);
              try {
                // First try to get user type from user_types collection
                const userTypeRef = doc(db, "user_types", candidate.userId);
                const userTypeDoc = await getDoc(userTypeRef);
                
                if (userTypeDoc.exists()) {
                  const userTypeData = userTypeDoc.data();
                  const userType = userTypeData.userType as 'Client' | 'HR';
                  console.log(`Found user type for ${candidate.userId}:`, userType);
                  
                  // Get user profile image
                  const profileImageUrl = await getUserProfileImage(candidate.userId!, userType);
                  if (profileImageUrl) {
                    console.log(`Found profile image for candidate ${candidate.id}:`, profileImageUrl);
                    // Validate the URL
                    if (profileImageUrl.startsWith('http')) {
                      const isValid = await validateImageUrl(profileImageUrl);
                      if (isValid) {
                        imageUrl = profileImageUrl;
                      } else {
                        console.warn(`Invalid profile image URL for candidate ${candidate.id}:`, profileImageUrl);
                      }
                    } else {
                      console.warn(`Invalid profile image URL for candidate ${candidate.id}:`, profileImageUrl);
                    }
                  } else {
                    console.log(`No profile image found for candidate ${candidate.id} with userId: ${candidate.userId}`);
                  }
                } else {
                  console.log(`No user type found for candidate ${candidate.id} with userId: ${candidate.userId}`);
                }
              } catch (error) {
                console.error(`Error fetching profile image for candidate ${candidate.id}:`, error);
              }
            }

            // Remove from loading state
            setImageLoading(prev => {
              const newSet = new Set(prev);
              newSet.delete(candidate.id);
              return newSet;
            });

            if (imageUrl) {
              console.log(`Final image URL for candidate ${candidate.id}:`, imageUrl);
            } else {
              console.log(`No image found for candidate ${candidate.id}`);
            }

            return imageUrl ? [candidate.id, imageUrl] as const : null;
          })
        );

        const urls = Object.fromEntries(urlEntries.filter(Boolean) as [string, string][]);
        console.log("Final fetched image URLs:", urls);
        setImageURLs(urls);
      } catch (error) {
        console.error("Error fetching images:", error);
        // Clear loading state for all candidates
        setImageLoading(new Set());
      }
    };

    if (candidates.length > 0) {
      fetchImages();
    } else {
      setImageURLs({});
      setImageLoading(new Set());
      setImageErrors(new Set());
      setRetryCount({});
    }

    // Cleanup function
    return () => {
      setImageLoading(new Set());
      setImageErrors(new Set());
      setRetryCount({});
    };
  }, [candidates]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Only search input is shown in the UI now

  const resetFilters = () => {
    setFilters({
      degree: "All",
      experience: "All",
      role: "All",
      department: "All",
      status: "All",
      technicalSkills: [],
      certifications: [],
      search: "",
    });
  };

  // Dynamic filter options derived from data
  const {
    degreeOptions,
    experienceOptions,
    roleOptions,
    departmentOptions,
    statusOptions,
    skillOptions,
    certificationOptions,
  } = useMemo(() => {
    const unique = <T extends string>(arr: (T | undefined)[]) => {
      return Array.from(
        new Set(
          arr
            .filter((v): v is T => Boolean(v))
            .map((v) => v!.toString().trim())
            .filter(Boolean)
        )
      );
    };

    const degrees = unique(candidates.map((c) => c.education));
    const roles = unique(candidates.map((c) => c.role));
    const departments = unique(candidates.map((c) => c.department));
    const statuses = unique(candidates.map((c) => c.status));
    const skills = unique(
      candidates.flatMap((c) => (c.skills && c.skills.length ? c.skills : []))
    );
    const certs = unique(
      candidates.flatMap((c) =>
        c.certifications && c.certifications.length ? c.certifications : []
      )
    );

    return {
      degreeOptions: ["All", ...degrees],
      experienceOptions: ["All", "1 year", "2 years", "3 years", "5+ years"],
      roleOptions: ["All", ...roles],
      departmentOptions: ["All", ...departments],
      statusOptions: ["All", ...statuses],
      skillOptions: skills,
      certificationOptions: certs,
    };
  }, [candidates]);

  // Count not needed when only search is visible

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedRows);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedRows(newSet);
  };

  const handleApprove = async (id: string) => {
    try {
      await updateCandidate(id, { status: "Approved" });
      setCandidateStatusMap((prev) => ({ ...prev, [id]: "Approved" }));
    } catch (error) {
      console.error("Error updating candidate status:", error);
      alert("Failed to update candidate status. Please try again.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateCandidate(id, { status: "Rejected" });
      setCandidateStatusMap((prev) => ({ ...prev, [id]: "Rejected" }));
    } catch (error) {
      console.error("Error updating candidate status:", error);
      alert("Failed to update candidate status. Please try again.");
    }
  };

  // Enhanced filter function
  const matchesFilter = (candidate: Candidate) => {
    // Degree
    const degreeMatch =
      filters.degree === "All" ||
      (candidate.education &&
        candidate.education.toLowerCase().includes(filters.degree.toLowerCase()));

    // Experience (parse first number; '5+ years' => >=5)
    const experienceMatch = (() => {
      if (filters.experience === "All") return true;
      if (!candidate.experience) return false;
      const selected = filters.experience;
      const num = parseInt((candidate.experience.match(/\d+/)?.[0] || "0"), 10);
      if (selected.startsWith("5+")) return num >= 5;
      const selectedNum = parseInt(selected, 10);
      return num >= selectedNum; // treat as at least
    })();

    // Role
    const roleMatch =
      filters.role === "All" ||
      (candidate.role &&
        candidate.role.toLowerCase().includes(filters.role.toLowerCase()));

    // Department
    const departmentMatch =
      filters.department === "All" ||
      (candidate.department &&
        candidate.department.toLowerCase() === filters.department.toLowerCase());

    // Status
    const statusMatch =
      filters.status === "All" ||
      (candidate.status &&
        candidate.status.toLowerCase() === filters.status.toLowerCase());

    // Technical skills (ANY of selected)
    const technicalSkillsMatch =
      filters.technicalSkills.length === 0 ||
      (candidate.skills &&
        candidate.skills.some((s) =>
          filters.technicalSkills.some(
            (sel) => s.toLowerCase() === sel.toLowerCase()
          )
        ));

    // Certifications (ANY of selected)
    const certificationsMatch =
      filters.certifications.length === 0 ||
      (candidate.certifications &&
        candidate.certifications.some((c) =>
          filters.certifications.some(
            (sel) => c.toLowerCase() === sel.toLowerCase()
          )
        ));

    // Search term across multiple fields
    const search = filters.search.trim().toLowerCase();
    const searchMatch =
      search.length === 0 ||
      [
        candidate.name,
        candidate.email,
        candidate.phone,
        candidate.role,
        candidate.department,
        candidate.experience,
        candidate.education,
        candidate.rawText,
        ...(candidate.skills || []),
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(search));

    return (
      degreeMatch &&
      experienceMatch &&
      roleMatch &&
      departmentMatch &&
      statusMatch &&
      technicalSkillsMatch &&
      certificationsMatch &&
      searchMatch
    );
  };

  const HandleLogout = () => {
    alert("Logout successful");
    navigate("/login");
  };

  // Get filtered candidates
  const filteredCandidates = candidates.filter(matchesFilter);

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper function to render avatar
  const renderAvatar = (candidate: Candidate) => {
    const hasImageUrl = Boolean(imageURLs[candidate.id]);

    if (hasImageUrl && !imageErrors.has(candidate.id)) {
      return (
        <img
          src={imageURLs[candidate.id]}
          alt={candidate.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
          onError={(e) => {
            console.log(`Image failed to load for candidate ${candidate.id}, hiding avatar`);
            setImageErrors(prev => new Set([...prev, candidate.id]));
          }}
        />
      );
    }

    // No image available: render nothing
    return null;
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Candidates</h1>
          <div className="text-sm text-gray-500">
            Total Candidates: {candidates.length} | 
            Showing: {filteredCandidates.length}
          </div>
        </div>

        {/* Filters: only search */}
        <div className="mb-6">
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <div className="relative max-w-xl">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name, email, role, skills..."
                className="w-full rounded-full border border-gray-300 pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
        </div>

        {/* Debug information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Debug Info:</strong> {candidates.length} candidates loaded, {filteredCandidates.length} filtered
            </p>
          </div>
        )}

        {/* Candidates list */}
        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No candidates found.</p>
            <p className="text-gray-400 text-sm mt-2">Candidates will appear here once CVs are uploaded.</p>
            <div className="mt-4">
              <p className="text-xs text-gray-400">
                If you've uploaded CVs but don't see them here, please check the browser console for any errors.
              </p>
            </div>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No candidates match the current filters.</p>
            <button
              onClick={resetFilters}
              className="mt-2 text-sm px-4 py-2 rounded-full bg-blue-100 border hover:bg-blue-200 text-blue-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="border rounded-lg p-6 hover:shadow-lg transition-all bg-white">
                <div className="flex justify-between items-center">
                  {/* Avatar, Name, Role */}
                  <div className="flex items-center gap-4 flex-1">
                    {renderAvatar(candidate)}
                    <div>
                      <p className="font-semibold text-lg text-gray-900">{candidate.name}</p>
                      <p className="text-sm text-gray-500">{candidate.role || "Not specified"}</p>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="text-gray-700 w-[200px] text-center">
                    <p className="font-medium">{candidate.department || "General"}</p>
                  </div>

                  {/* Status */}
                  <div className="w-[150px] text-center">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        (candidateStatusMap[candidate.id] || candidate.status) === "Approved"
                          ? "bg-green-100 text-green-700"
                          : (candidateStatusMap[candidate.id] || candidate.status) === "Full-Time"
                          ? "bg-blue-100 text-blue-700"
                          : (candidateStatusMap[candidate.id] || candidate.status) === "Part-Time"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {candidateStatusMap[candidate.id] || candidate.status || "Pending"}
                    </span>
                  </div>

                  {/* Contact */}
                  <div className="w-[300px] text-sm text-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail size={16} className="text-gray-500 flex-shrink-0" />
                      <a 
                        href={`mailto:${candidate.email}`} 
                        className="hover:underline text-blue-600 truncate block"
                        title={candidate.email}
                      >
                        {candidate.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500 flex-shrink-0" />
                      <a 
                        href={`tel:${candidate.phone}`} 
                        className="hover:underline text-blue-600"
                      >
                        {candidate.phone}
                      </a>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="w-[50px] text-center">
                    <button
                      onClick={() => toggleExpand(candidate.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="View details"
                    >
                      {expandedRows.has(candidate.id) ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedRows.has(candidate.id) && (
                  <div className="mt-6 bg-gray-50 p-6 rounded-lg text-sm text-gray-700 space-y-4 border-t">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Professional Information</h4>
                        <div className="space-y-2">
                          <div><strong>Skills:</strong> {candidate.skills?.join(", ") || "N/A"}</div>
                          <div><strong>Experience:</strong> {candidate.experience || "N/A"}</div>
                          <div><strong>Education:</strong> {candidate.education || "N/A"}</div>
                          {candidate.certifications && candidate.certifications.length > 0 && (
                            <div><strong>Certifications:</strong> {candidate.certifications.join(", ")}</div>
                          )}
                          {candidate.languages && candidate.languages.length > 0 && (
                            <div><strong>Languages:</strong> {candidate.languages.join(", ")}</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Additional Information</h4>
                        <div className="space-y-2">
                          {candidate.address && <div><strong>Address:</strong> {candidate.address}</div>}
                          {candidate.linkedin && (
                            <div>
                              <strong>LinkedIn:</strong>{" "}
                              <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                View Profile
                              </a>
                            </div>
                          )}
                          {candidate.portfolio && (
                            <div>
                              <strong>Portfolio:</strong>{" "}
                              <a href={candidate.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                View Portfolio
                              </a>
                            </div>
                          )}
                          {candidate.availability && <div><strong>Availability:</strong> {candidate.availability}</div>}
                          {candidate.salary && <div><strong>Salary Expectation:</strong> {candidate.salary}</div>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <strong>Actions:</strong>
                        </div>
                        <div className="flex gap-2">
                          {candidateStatusMap[candidate.id] === "Approved" ? (
                            <span className="text-green-600 font-semibold flex items-center gap-2">
                              ✅ Approved
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApprove(candidate.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => handleReject(candidate.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
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
