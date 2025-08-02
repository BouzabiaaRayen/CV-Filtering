import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { collection, addDoc, onSnapshot, query, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "../components/firebase/firebase";

export type Candidate = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: string;
  email: string;
  phone: string;
  avatar?: string; // image file name in Firebase Storage
  skills?: string[];
  experience?: string;
  education?: string;
  rawText?: string;
};

type CandidatesContextType = {
  candidates: Candidate[];
  addCandidate: (candidate: Omit<Candidate, "id">) => Promise<void>;
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

  useEffect(() => {
    const q = query(collection(db, "candidates"));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const candidatesData: Candidate[] = [];
        querySnapshot.forEach((doc) => {
          candidatesData.push({ id: doc.id, ...(doc.data() as Omit<Candidate, "id">) });
        });
        setCandidates(candidatesData);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore onSnapshot error: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addCandidate = async (candidate: Omit<Candidate, "id">) => {
    try {
      await addDoc(collection(db, "candidates"), candidate);
    } catch (error) {
      console.error("Error adding candidate: ", error);
    }
  };

  if (loading) return <p>Loading candidates...</p>;

  return (
    <CandidatesContext.Provider value={{ candidates, addCandidate }}>
      {children}
    </CandidatesContext.Provider>
  );
};

export default CandidatesProvider;
