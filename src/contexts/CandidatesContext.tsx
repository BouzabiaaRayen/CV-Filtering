import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { collection, addDoc, onSnapshot, query, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "../components/firebase/firebase";
import { getAuth } from "firebase/auth";

export type Candidate = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: string; // "Pending", "Approved", "Rejected", "Full-Time", "Part-Time", etc.
  email: string;
  phone: string;
  avatar?: string; // image file name in Firebase Storage
  skills?: string[];
  experience?: string;
  education?: string;
  rawText?: string;
  createdAt?: string;
  updatedAt?: string;
  // Additional fields for better candidate management
  address?: string;
  linkedin?: string;
  portfolio?: string;
  certifications?: string[];
  languages?: string[];
  availability?: string;
  salary?: string;
  notes?: string;
  userId?: string; // ID of the user who uploaded the CV
};

type CandidatesContextType = {
  candidates: Candidate[];
  addCandidate: (candidate: Omit<Candidate, "id">) => Promise<void>;
  updateCandidate: (id: string, updates: Partial<Candidate>) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
};

const CandidatesContext = createContext<CandidatesContextType | undefined>(undefined);

export const useCandidates = (): CandidatesContextType => {
  const context = useContext(CandidatesContext);
  if (!context) {
    throw new Error("useCandidates must be used within a CandidatesProvider");
  }
  return context;
};

type CandidatesProviderProps = {
  children: ReactNode;
};

export const CandidatesProvider = ({ children }: CandidatesProviderProps) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("CandidatesProvider: Setting up real-time listener for candidates");
    setError(null);
    
    const q = query(collection(db, "candidates"));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const candidatesData: Candidate[] = [];
        console.log("CandidatesProvider: Received snapshot with", querySnapshot.size, "documents");
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("CandidatesProvider: Processing candidate", doc.id, data);
          candidatesData.push({ id: doc.id, ...(data as Omit<Candidate, "id">) });
        });
        console.log("CandidatesProvider: Setting candidates state with", candidatesData.length, "candidates");
        setCandidates(candidatesData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("CandidatesProvider: Firestore onSnapshot error: ", error);
        setError(error.message);
        // Try to get candidates using a one-time read as fallback
        const getCandidatesFallback = async () => {
          try {
            const { getDocs } = await import("firebase/firestore");
            const querySnapshot = await getDocs(collection(db, "candidates"));
            const candidatesData: Candidate[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              candidatesData.push({ id: doc.id, ...(data as Omit<Candidate, "id">) });
            });
            console.log("CandidatesProvider: Fallback loaded", candidatesData.length, "candidates");
            setCandidates(candidatesData);
            setError(null);
          } catch (fallbackError) {
            console.error("CandidatesProvider: Fallback also failed:", fallbackError);
            setError("Failed to load candidates. Please refresh the page.");
          } finally {
            setLoading(false);
          }
        };
        getCandidatesFallback();
      }
    );

    return () => {
      console.log("CandidatesProvider: Cleaning up real-time listener");
      unsubscribe();
    };
  }, []);

  const addCandidate = async (candidate: Omit<Candidate, "id">) => {
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      const candidateData = {
        ...candidate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: candidate.status || "Pending",
        userId: userId || "someUserId" // Placeholder for actual user ID
      };
      await addDoc(collection(db, "candidates"), candidateData);
    } catch (error) {
      console.error("Error adding candidate: ", error);
      throw error;
    }
  };

  const updateCandidate = async (id: string, updates: Partial<Candidate>) => {
    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      const candidateRef = doc(db, "candidates", id);
      await updateDoc(candidateRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating candidate: ", error);
      throw error;
    }
  };

  const deleteCandidate = async (id: string) => {
    try {
      const { doc, deleteDoc } = await import("firebase/firestore");
      const candidateRef = doc(db, "candidates", id);
      await deleteDoc(candidateRef);
    } catch (error) {
      console.error("Error deleting candidate: ", error);
      throw error;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading candidates...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;

  return (
    <CandidatesContext.Provider value={{ candidates, addCandidate, updateCandidate, deleteCandidate }}>
      {children}
    </CandidatesContext.Provider>
  );
};

export default CandidatesProvider;
