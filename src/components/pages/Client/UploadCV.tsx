import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCandidates } from "../../../contexts/CandidatesContext";
import CVParser from "../../../scripts/CVParser";

const UploadCV = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<any>(null);
  const navigate = useNavigate();

  const { addCandidate } = useCandidates();

  const HandleLogout = () => {
    alert("Logout successfully");
    navigate("/login");
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setExtractedInfo(null);
    }
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setSelectedFile(event.dataTransfer.files[0]);
      setExtractedInfo(null);
      event.dataTransfer.clearData();
    }
  }, []);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setUploading(true);

    try {
      const { storage } = await import("../../../components/firebase/firebase");
      const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");

      // 1. Upload file to Firebase Storage
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const storageRef = ref(storage, `cvs/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Upload failed:", error);
          alert("Upload failed. Please try again.");
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);

          // 2. Parse the file using CVParser
          try {
            const extractedInfo = await CVParser.parseCV(selectedFile);
            console.log("Extracted info:", extractedInfo);
            setExtractedInfo(extractedInfo);

            // 3. Add candidate using context with all extracted data
            await addCandidate({
              name: extractedInfo.name,
              role: extractedInfo.role,
              department: extractedInfo.department,
              status: extractedInfo.status || "Pending",
              email: extractedInfo.email,
              phone: extractedInfo.phone,
              avatar: downloadURL,
              skills: extractedInfo.skills || [],
              experience: extractedInfo.experience,
              education: extractedInfo.education,
              rawText: extractedInfo.rawText,
              address: extractedInfo.address,
              linkedin: extractedInfo.linkedin,
              portfolio: extractedInfo.portfolio,
              certifications: extractedInfo.certifications || [],
              languages: extractedInfo.languages || [],
              availability: extractedInfo.availability || "Available",
              salary: extractedInfo.salary || "",
              notes: extractedInfo.notes || ""
            });

            alert("CV uploaded and candidate added successfully!");
            setSelectedFile(null);
            setExtractedInfo(null);
          } catch (parseError) {
            console.error("CV parsing failed:", parseError);
            alert("Failed to extract info from CV.");
          } finally {
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload.");
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-60 bg-gray-50 p-6 border-r">
        <h2 className="text-blue-600 font-bold text-2xl">ProxymHR</h2>
        <nav className="mt-10 space-y-4">
          <div className="font-semibold text-black">
            <Link to="/client" className="hover:underline">
              Profile
            </Link>
          </div>
          <div className="text-blue-600 font-semibold underline">Upload CV</div>
          <div className="text-gray-600 hover:text-blue-600 font-semibold">
            <Link to="/suivie" className="hover:underline">
              Suivie
            </Link>
          </div>
        </nav>
        <button
          onClick={HandleLogout}
          className="hover:underline text-red-500 absolute bottom-6 left-6"
        >
          Log Out
        </button>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-xl font-semibold mb-6">Upload your CV</h1>
        <p className="mb-2 font-medium text-center">Select or drop the file</p>

        <input
          type="file"
          id="fileInput"
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          onChange={onFileChange}
        />

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="mx-auto w-[872px] h-[374px] border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0-8l-4 4m4-4l4 4m-4-12v8"
            />
          </svg>
          <p className="text-gray-600 mb-1">Select a file or drag and drop here</p>
          <p className="text-gray-400 text-sm mb-4">File size max: 50MB</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById("fileInput")?.click();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            SELECT FILE
          </button>
          {selectedFile && (
            <p className="mt-4 text-green-600">Selected file: {selectedFile.name}</p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "UPLOADING..." : "UPLOAD & EXTRACT"}
        </button>

        {/* Display extracted information */}
        {extractedInfo && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Extracted Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Name:</strong> {extractedInfo.name}</p>
                <p><strong>Email:</strong> {extractedInfo.email}</p>
                <p><strong>Phone:</strong> {extractedInfo.phone}</p>
                <p><strong>Role:</strong> {extractedInfo.role}</p>
                <p><strong>Department:</strong> {extractedInfo.department}</p>
                <p><strong>Status:</strong> {extractedInfo.status}</p>
              </div>
              <div>
                <p><strong>Skills:</strong> {extractedInfo.skills?.join(", ")}</p>
                <p><strong>Experience:</strong> {extractedInfo.experience}</p>
                <p><strong>Education:</strong> {extractedInfo.education}</p>
                <p><strong>Languages:</strong> {extractedInfo.languages?.join(", ")}</p>
                <p><strong>Certifications:</strong> {extractedInfo.certifications?.join(", ")}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UploadCV;
