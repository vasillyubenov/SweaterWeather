import { FirebaseController } from "./firebaseController.js";

const firebaseController = new FirebaseController();

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

    if (await firebaseController.checkUserEmailExists(email)) {
        alert('Account with this email already exists');
        return;
    }

    firebaseController.writeUserData(email, password, username);
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
    const docId = await firebaseController.readUserData(email, password);
    if (docId) {
        localStorage.setItem('currentUser', docId);
        window.location.href = '/app';
    }
});