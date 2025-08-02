import { db, storage } from "./firebase";
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

const auth = getAuth();

function logAuthState() {
  const user = auth.currentUser;
  if (user) {
    console.log("User is logged in:", user.uid);
    user.getIdToken(true).then(token => {
      console.log("User ID token:", token);
    }).catch(err => {
      console.error("Error getting IDa token:", err);
    });
  } else {
    console.log("No user is currently logged in.");
  }
}

// TypeScript interfaces
export interface HRProfile {
  fullName: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  profileImageUrl?: string;
  tempsService: string;
  job: string;
  department: string;
  userId: string;
  updatedAt: string;
}

export interface ClientProfile {
  fullName: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  profileImageUrl?: string;
  userId: string;
  updatedAt: string;
}

export interface DatabaseResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Save HR profile data to Firestore
export const saveHRData = async (hrData: Omit<HRProfile, 'userId' | 'updatedAt'>): Promise<DatabaseResponse> => {
  try {
    logAuthState();
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("No authenticated user");
    }

    const hrRef = doc(db, "hr_profiles", user.uid);

    const profileData: HRProfile = {
      ...hrData,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    };

    await setDoc(hrRef, profileData, { merge: true });

    return { success: true, message: "HR profile saved successfully" };
  } catch (error) {
    console.error("Error saving HR data:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to save HR profile" };
  }
};

// Save Client profile data to Firestore
export const saveClientData = async (clientData: Omit<ClientProfile, 'userId' | 'updatedAt'>): Promise<DatabaseResponse> => {
  try {
    logAuthState();
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("No authenticated user");
    }

    const clientRef = doc(db, "client_profiles", user.uid);
    
    const profileData: ClientProfile = {
      ...clientData,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    };

    await setDoc(clientRef, profileData, { merge: true });

    return { success: true, message: "Client profile saved successfully" };
  } catch (error) {
    console.error("Error saving client data:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to save client profile" };
  }
};

// Upload profile image to Firebase Storage
export const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
  try {
    const storageRef = ref(storage, `profile_images/${userId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Get HR profile data from Firestore
export const getHRData = async (): Promise<DatabaseResponse<HRProfile | null>> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("No authenticated user");
    }

    const hrRef = doc(db, "hr_profiles", user.uid);
    const hrDoc = await getDoc(hrRef);
    
    if (hrDoc.exists()) {
      return { success: true, data: hrDoc.data() as HRProfile };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error("Error getting HR data:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to get HR profile" };
  }
};

// Get Client profile data from Firestore
export const getClientData = async (): Promise<DatabaseResponse<ClientProfile | null>> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("No authenticated user");
    }

    const clientRef = doc(db, "client_profiles", user.uid);
    const clientDoc = await getDoc(clientRef);
    
    if (clientDoc.exists()) {
      return { success: true, data: clientDoc.data() as ClientProfile };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error("Error getting client data:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to get client profile" };
  }
};
