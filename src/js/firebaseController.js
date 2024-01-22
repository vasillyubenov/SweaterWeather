import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore/lite";

class FirebaseController {

    constructor() {
        const firebaseConfig = {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID
        };

        // Initialize Firebase
        this.app = initializeApp(firebaseConfig);
        this.database = getFirestore(app);
    }

    async writeUserData(email, password, username) {
        try {
            const docRef = await addDoc(collection(database, "users"), {
                email,
                password,
                username
            });
    
            await addDoc(collection(database, "usersLocations"), {
                email: email,
                locations: []
            });
        }
        catch (e) {
            console.error("Error adding document: ", e);
        }
    }
    
    async readUserData(email, password) {
        const querySnapshot = await getDocs(collection(database, "users"));
        querySnapshot.forEach((doc) => {
            if (doc.data() != null && doc.data().email === email && doc.data().password === password) {
                return doc.id;
            }
        });
        return null;
    }
    
    async checkUserEmailExists(email) {
        const querySnapshot = await getDocs(collection(database, "users"));
        let userExists = false;
        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            if (data.email === email) {
                userExists = true;
                break;
            }
        }
        return userExists;
    }

    async addLocation(uid, location) {
        try {
            //firstly we need to read old locations and if not present add the new one
            const docRef = await addDoc(collection(database, "users"), {
                email,
                password,
                username
            });
    
            await addDoc(collection(database, "usersLocations"), {
                email: email,
                locations: []
            });
        }
        catch (e) {
            console.error("Error adding document: ", e);
        }
    }
}

export default FirebaseController;