import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore/lite";

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

function onRegisterClick() {
    isRegistering = true;
    changeTab();
}

function onLoginClick() {
    isRegistering = false;
    changeTab();
}

function setLoginPageActive() {
    document.querySelector(".reg-body").classList.add("active");
    document.querySelector(".reg-body").classList.remove("hide");

    document.querySelector(".app-body").classList.remove("active");
    document.querySelector(".app-body").classList.add("hide");
}

function setAppPageActive() {
    document.querySelector(".reg-body").classList.add("hide");
    document.querySelector(".reg-body").classList.remove("active");

    document.querySelector(".app-body").classList.add("active");
    document.querySelector(".app-body").classList.remove("hide");
}

register.addEventListener("click", onRegisterClick);

login.addEventListener("click", onLoginClick);

document.querySelector("#sign-up-btn").addEventListener("click", async (e) => {
    e.preventDefault();

    let username = document.getElementById("reg-username").value;
    let email = document.getElementById("reg-email").value;
    let password = document.getElementById("reg-password").value;
    let confirmPassword = document.getElementById("reg-confirm-password").value;

    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    if (!validateEmail(email)) {
        alert('Please enter a valid Email address');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (password.length < 6 || confirmPassword.length < 6) {
        alert('Please enter a valid password longer that 6 symbols');
        return;
    }

    if (await checkUserEmailExists(email)) {
        alert('Account with this email already exists');
        return;
    }

    writeUserData(email, password, username);
    onLoginClick();
});

document.querySelector("#login-btn").addEventListener("click", async (e) => {
    e.preventDefault();

    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-password").value;

    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    if (!validateEmail(email)) {
        alert('Please enter a valid Email address');
        return;
    }

    if (document.getElementById("login-password").value.length < 6) {
        alert('Please enter a valid password longer that 6 symbols');
        return;
    }
    const userId = await readUserData(email, password);
    if (userId === null) {
        alert(`Logged into account ${userId}`);
        setAppPageActive();
    }
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
        if (doc.data() != null && doc.data().email === email && doc.data().password === password) {
            return doc.id;
        }  
    });
    return null;
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