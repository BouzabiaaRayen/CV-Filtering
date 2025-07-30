import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCandidates } from "../../../contexts/CandidatesContext";

const UploadCV = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  // Using useCandidates hook
  const { candidates, addCandidate } = useCandidates();

  const HandleLogout = () => {
    alert("logout succesfully");
    navigate("/login");
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setSelectedFile(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }, []);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
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
          <div className="text-gray-600 hover:underline hover:text-blue-600 font-semibold">
            Upload CV
          </div>
          <div className="text-gray-600 hover:text-blue-600 font-semibold">
            <Link to="/suivie" className="hover:underline">
              Suivie
            </Link>
          </div>
        </nav>
        <button
          onClick={HandleLogout}
          className="hover:underline text-red-500 mt-20 absolute bottom-6 left-6"
        >
          Log Out
        </button>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-xl font-semibold mb-6">Upload you're CV</h1>
        <p className="mb-2 font-medium text-center">Select or drop the file</p>

        <input
          type="file"
          id="fileInput"
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
          <p className="text-gray-600 mb-1">Select a file or drop and drop here</p>
          <p className="text-gray-400 text-sm mb-4">file size no more than 50MB</p>
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
          onClick={async () => {
            if (selectedFile) {
              try {
                const { storage } = await import("../../../components/firebase/firebase");
                const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");

                const storageRef = ref(storage, `cvs/${selectedFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, selectedFile);

                uploadTask.on(
                  "state_changed",
                  (snapshot) => {
                    // Progress function (optional)
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                  },
                  (error) => {
                    // Error function
                    console.error("Upload failed:", error);
                    alert("Upload failed. Please try again.");
                  },
                  () => {
                    // Complete function
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                  console.log("File available at", downloadURL);
                  alert(`Upload successful! File URL: ${downloadURL}`);

                  // Add candidate with CV URL
                  try {
                    // Use the addCandidate function from context hook
                    await addCandidate({
                      name: "New Candidate",
                      role: "Unknown",
                      department: "Unknown",
                      status: "Pending",
                      email: "unknown@example.com",
                      phone: "0000000000",
                      avatar: downloadURL
                    });
                    alert("Candidate added successfully.");
                  } catch (error) {
                    console.error("Error adding candidate:", error);
                    alert("Failed to add candidate.");
                  }
                });
                  }
                );
              } catch (error) {
                console.error("Error uploading file:", error);
                alert("Error uploading file. Please try again.");
              }
            } else {
              alert("Please select a file first.");
            }
          }}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          UPLOAD
        </button>
      </main>
    </div>
  );
};
export default UploadCV;
