//import { initializeApp } from 'firebase/app';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAEbtRnLMNLxkuX8SbNq2lmnwArU5Ny-2E",
    authDomain: "sweaterweather-32f0b.firebaseapp.com",
    projectId: "sweaterweather-32f0b",
    storageBucket: "sweaterweather-32f0b.appspot.com",
    messagingSenderId: "478485494858",
    appId: "1:478485494858:web:3346bae1e73744a4ecfab3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let isRegistering = true;

// Initialize Firebase
const database = getFirestore(app);

let register = document.querySelector(".signup-tab");
let login = document.querySelector(".login-tab");

function changeTab() {
    try {
        if (!isRegistering) {
            document.getElementById("form-body").classList.remove('active');
            login.parentNode.classList.remove('signup');
        } else {
            document.getElementById("form-body").classList.add('active');
            register.parentNode.classList.add('signup');
        }
    } catch (msg) {
        console.log(msg);
    }
}

register.addEventListener("click", () => {  
    isRegistering = true;
    changeTab();
});

login.addEventListener("click", () => { 
    isRegistering = false;
    changeTab();
});

document.querySelector("#sign-up-btn").addEventListener("click", async (e) => {
    e.preventDefault();

    let username = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    if (!validateEmail(email)) {
        document.getElementById('register-error').textContent = 'Please enter a valid Email address';
        return;
    }

    if (document.getElementById("password").value.length >= 6) {
        document.getElementById('emailError').textContent = 'Please enter a valid password longer that 6 symbols';
        return;
    }

    if (await checkUserEmailExists(email)) {
        document.getElementById('emailError').textContent = 'Account with this email already exists';
        return;
    }

    writeUserData(email, password, username);
});

document.querySelector("#login-btn").addEventListener("click", async (e) => {
    e.preventDefault();

    let username = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    if (!validateEmail(email)) {
        document.getElementById('register-error').textContent = 'Please enter a valid Email address';
        return;
    }

    if (document.getElementById("password").value.length >= 6) {
        document.getElementById('emailError').textContent = 'Please enter a valid password longer that 6 symbols';
        return;
    }

    if (await checkUserEmailExists(email)) {
        document.getElementById('emailError').textContent = 'Account with this email already exists';
        return;
    }

    writeUserData(email, password, username);
});

async function writeUserData(email, password, username) {
    try {
        const docRef = await addDoc(collection(database, "users"), {
            email,
            password,
            username
        });
        console.log("Document written with ID: ", docRef.id);
    }
    catch (e) {
        console.error("Error adding document: ", e);
    }
}

async function readUserData(email, password) {
    const querySnapshot = await getDocs(collection(database, "users"));
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
    });
}

async function checkUserEmailExists(email) {
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