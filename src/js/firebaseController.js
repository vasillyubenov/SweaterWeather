import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc, doc } from "firebase/firestore/lite";

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
                locations: [],
                alarm: {}
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
            if (docSnap.data().locations.indexOf(location) == -1) {
                await updateDoc(usersRef, {
                    locations: [...docSnap.data().locations, location]
                });
            }
        }
    }

    async updateAlarm(uid, newAlarm) {
        const usersRef = doc(this.database, "users", uid);
        const docSnap = await getDoc(usersRef);

        if (docSnap.exists()) {
            if (docSnap.data().locations.indexOf(location) == -1) {
                await updateDoc(usersRef, {
                    alarm: newAlarm
                });
            }
        }
    }

    async removeLocation(uid, location, errorCallback) {
        const usersRef = doc(this.database, "users", uid);
        const docSnap = await getDoc(usersRef);

        if (docSnap.exists()) {
            const locationIndex = docSnap.data().locations.indexOf(location);
            if (locationIndex != -1) {
                let locs = docSnap.data().locations;
                locs.splice(locationIndex, 1);

                await updateDoc(usersRef, {
                    locations: locs
                });
                return;
            }
            errorCallback("No such city!");
            return;
        }

        errorCallback("User doesn't exist!");
    }

    async getLocations(uid) {
        const usersRef = doc(this.database, "users", uid);
        const docSnap = await getDoc(usersRef);

        if (docSnap.exists()) {
            return docSnap.data().locations;
        }

        return null;
    }

    async getAlarm(uid) {
        const usersRef = doc(this.database, "users", uid);
        const docSnap = await getDoc(usersRef);

        if (docSnap.exists()) {
            return docSnap.data().alarm;
        }

        return null;
    }
}