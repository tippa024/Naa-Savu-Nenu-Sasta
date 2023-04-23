import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';


 

export const handleGoogleSignIn = async () => {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error('Error signing in:', error);
    }
};
 export const handleLogout = async () => {
    try {
        const auth = getAuth();
        await signOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
    }
};