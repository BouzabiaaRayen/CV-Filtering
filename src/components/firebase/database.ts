import { db, storage } from "./firebase";
import { collection, doc, setDoc, getDoc, updateDoc, enableNetwork, disableNetwork } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();

function logAuthState() {
  const user = auth.currentUser;
  if (user) {
    console.log("User is logged in:", user.uid);
    user.getIdToken(true).then(token => {
      console.log("User ID token:", token);
    }).catch(err => {
      console.error("Error getting ID token:", err);
    });
  } else {
    console.log("No user is currently logged in.");
  }
}

// Function to ensure network connectivity
async function ensureNetworkConnection() {
  try {
    await enableNetwork(db);
    console.log("Firestore network connection enabled");
  } catch (error) {
    console.error("Error enabling network:", error);
  }
}

// Function to wait for authentication
async function waitForAuth(): Promise<boolean> {
  return new Promise((resolve) => {
    // If user is already authenticated, resolve immediately
    if (auth.currentUser) {
      console.log("User already authenticated:", auth.currentUser.uid);
      resolve(true);
      return;
    }

    // Otherwise, wait for auth state change
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        console.log("User authenticated:", user.uid);
        resolve(true);
      } else {
        console.log("No user authenticated");
        resolve(false);
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      unsubscribe();
      console.log("Authentication timeout");
      resolve(false);
    }, 10000);
  });
}

// Function to verify authentication and get user
async function verifyAuth(): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // Ensure network connection
    await ensureNetworkConnection();
    
    // Wait for authentication
    const isAuthenticated = await waitForAuth();
    if (!isAuthenticated) {
      return { 
        success: false, 
        error: "User not authenticated. Please log in again." 
      };
    }

    const user = auth.currentUser;
    if (!user) {
      return { 
        success: false, 
        error: "No authenticated user found" 
      };
    }

    // Verify user has a valid ID token
    try {
      await user.getIdToken(true);
      console.log("User authentication verified:", user.uid);
      return { success: true, user };
    } catch (tokenError) {
      console.error("Error getting user token:", tokenError);
      return { 
        success: false, 
        error: "User authentication token is invalid. Please log in again." 
      };
    }
  } catch (error) {
    console.error("Error verifying authentication:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Authentication verification failed" 
    };
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

export interface UserType {
  userId: string;
  userType: 'Client' | 'HR';
  email: string;
  createdAt: string;
}

export interface DatabaseResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Save HR profile data to Firestore
export const saveHRData = async (hrData: Omit<HRProfile, 'userId' | 'updatedAt'>): Promise<DatabaseResponse> => {
  try {
    console.log("Starting HR data save process...");
    
    // Verify authentication
    const authResult = await verifyAuth();
    if (!authResult.success) {
      console.error("Authentication failed:", authResult.error);
      return { success: false, message: authResult.error };
    }

    const user = authResult.user;
    console.log("Attempting to save HR data for user:", user.uid);
    console.log("HR data to save:", hrData);

    const hrRef = doc(db, "hr_profiles", user.uid);

    const profileData: HRProfile = {
      ...hrData,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    };

    console.log("Saving profile data:", profileData);

    await setDoc(hrRef, profileData, { merge: true });
    console.log("HR profile saved successfully");

    return { success: true, message: "HR profile saved successfully" };
  } catch (error) {
    console.error("Error saving HR data:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to save HR profile" };
  }
};

// Save Client profile data to Firestore
export const saveClientData = async (clientData: Omit<ClientProfile, 'userId' | 'updatedAt'>): Promise<DatabaseResponse> => {
  try {
    console.log("Starting client data save process...");
    
    // Verify authentication
    const authResult = await verifyAuth();
    if (!authResult.success) {
      console.error("Authentication failed:", authResult.error);
      return { success: false, message: authResult.error };
    }

    const user = authResult.user;
    console.log("Attempting to save client data for user:", user.uid);
    console.log("Client data to save:", clientData);

    const clientRef = doc(db, "client_profiles", user.uid);
    
    const profileData: ClientProfile = {
      ...clientData,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    };

    console.log("Saving profile data:", profileData);

    await setDoc(clientRef, profileData, { merge: true });
    console.log("Client profile saved successfully");

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
    console.log("Starting HR data retrieval process...");
    
    // Verify authentication
    const authResult = await verifyAuth();
    if (!authResult.success) {
      console.error("Authentication failed:", authResult.error);
      return { success: false, message: authResult.error };
    }

    const user = authResult.user;
    console.log("Attempting to get HR data for user:", user.uid);

    const hrRef = doc(db, "hr_profiles", user.uid);
    const hrDoc = await getDoc(hrRef);
    
    if (hrDoc.exists()) {
      console.log("HR data retrieved successfully");
      return { success: true, data: hrDoc.data() as HRProfile };
    } else {
      console.log("No HR data found for user");
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
    console.log("Starting client data retrieval process...");
    
    // Verify authentication
    const authResult = await verifyAuth();
    if (!authResult.success) {
      console.error("Authentication failed:", authResult.error);
      return { success: false, message: authResult.error };
    }

    const user = authResult.user;
    console.log("Attempting to get client data for user:", user.uid);

    const clientRef = doc(db, "client_profiles", user.uid);
    const clientDoc = await getDoc(clientRef);
    
    if (clientDoc.exists()) {
      console.log("Client data retrieved successfully");
      return { success: true, data: clientDoc.data() as ClientProfile };
    } else {
      console.log("No client data found for user");
      return { success: true, data: null };
    }
  } catch (error) {
    console.error("Error getting client data:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to get client profile" };
  }
};

// Save user type to Firestore
export const saveUserType = async (userId: string, userType: 'Client' | 'HR', email: string): Promise<DatabaseResponse> => {
  try {
    console.log("Saving user type:", { userId, userType, email });
    
    const userTypeRef = doc(db, "user_types", userId);
    const userTypeData: UserType = {
      userId,
      userType,
      email,
      createdAt: new Date().toISOString()
    };

    await setDoc(userTypeRef, userTypeData);
    console.log("User type saved successfully");
    
    return { success: true, message: "User type saved successfully" };
  } catch (error) {
    console.error("Error saving user type:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to save user type" };
  }
};

// Get user type from Firestore
export const getUserType = async (userId: string): Promise<DatabaseResponse<UserType | null>> => {
  try {
    console.log("Getting user type for user:", userId);
    
    const userTypeRef = doc(db, "user_types", userId);
    const userTypeDoc = await getDoc(userTypeRef);
    
    if (userTypeDoc.exists()) {
      console.log("User type retrieved successfully");
      return { success: true, data: userTypeDoc.data() as UserType };
    } else {
      console.log("No user type found for user");
      return { success: true, data: null };
    }
  } catch (error) {
    console.error("Error getting user type:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to get user type" };
  }
};

// Get user profile image by userId
export const getUserProfileImage = async (userId: string, userType: 'Client' | 'HR'): Promise<string | null> => {
  try {
    console.log("Getting profile image for user:", userId, "type:", userType);
    
    const collectionName = userType === 'HR' ? 'hr_profiles' : 'client_profiles';
    const userRef = doc(db, collectionName, userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const profileImageUrl = userData.profileImageUrl;
      console.log("Profile image URL found:", profileImageUrl);
      return profileImageUrl || null;
    } else {
      console.log("No profile found for user:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile image:", error);
    return null;
  }
};
