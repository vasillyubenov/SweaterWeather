import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc } from "firebase/firestore/lite";

export class FirebaseController {
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
        this.database = getFirestore(this.app);
    }

    async writeUserData(email, password, username) {
        try {
            await addDoc(collection(this.database, "users"), {
                email,
                password,
                username,
                locations: []
            });
        }
        catch (e) {
            console.error("Error adding document: ", e);
        }
    }
    
    async readUserData(email, password) {
        const querySnapshot = await getDocs(collection(this.database, "users"));
        let docId = null;

        querySnapshot.forEach((doc) => {
            if (doc.data() != null && doc.data().email === email && doc.data().password === password) {
                docId = doc.id;
            }
        });
        
        return docId;
    }
    
    async checkUserEmailExists(email) {
        const querySnapshot = await getDocs(collection(this.database, "users"));
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
        const usersRef = doc(this.database, "users", uid);
            const docSnap = await getDoc(usersRef);

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                if (docSnap.data().locations.indexOf(location) == -1) {
                    await updateDoc(washingtonRef, {
                        capital: [...docSnap.data().locations, location]
                    });
                }
            } else {
                console.log("No such document!");
            }
    }
}