/* ==========================================================
   SECUREGATE OTP AUTHENTICATION SYSTEM

   Classroom / demonstration project.

   Shared accounts and OTP requests:
   localStorage

   Login state:
   sessionStorage

   A real authentication system should use:
   - backend server
   - database
   - hashed passwords
   - secure sessions
========================================================== */


/* ==========================================================
   ADMIN ACCOUNT
========================================================== */

const ADMIN_EMAIL = "admin@securegate.com";
const ADMIN_PASSWORD = "Admin@123";


/* ==========================================================
   PAGE NAVIGATION
========================================================== */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(
            ".page"
        );

    pages.forEach(
        page => {

            page.classList.remove(
                "active"
            );

        }
    );


    const selectedPage =
        document.getElementById(
            pageId
        );


    if (selectedPage) {

        selectedPage.classList.add(
            "active"
        );

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (
        pageId ===
        "adminDashboardPage"
    ) {

        renderAdminDashboard();

    }
}


/* ==========================================================
   LOGIN / SIGNUP SWITCH
========================================================== */

function openTab(tab) {

    const loginForm =
        document.getElementById(
            "loginForm"
        );

    const signupForm =
        document.getElementById(
            "signupForm"
        );


    loginForm
        ?.classList
        .remove(
            "active"
        );


    signupForm
        ?.classList
        .remove(
            "active"
        );


    clearFormMessages();


    if (
        tab ===
        "signup"
    ) {

        signupForm
            ?.classList
            .add(
                "active"
            );

    } else {

        loginForm
            ?.classList
            .add(
                "active"
            );

    }
}


/* ==========================================================
   BACK TO LOGIN
========================================================== */

function goBackToLogin() {

    sessionStorage.removeItem(
        "currentUserRequest"
    );

    showPage(
        "authPage"
    );

    openTab(
        "login"
    );
}


/* ==========================================================
   USER SIDEBAR ACTIVE ITEM
========================================================== */

function setUserMenuActive(button) {

    document
        .querySelectorAll(
            ".simple-nav-link"
        )
        .forEach(
            link => {

                link.classList.remove(
                    "active"
                );

            }
        );


    button.classList.add(
        "active"
    );
}


/* ==========================================================
   PASSWORD VISIBILITY
========================================================== */

function togglePassword(
    inputId,
    button
) {

    const input =
        document.getElementById(
            inputId
        );


    if (!input) {
        return;
    }


    const icon =
        button
            ?.querySelector(
                "i"
            );


    if (
        input.type ===
        "password"
    ) {

        input.type =
            "text";


        if (icon) {

            icon.className =
                "fa-regular fa-eye-slash";

        }

    } else {

        input.type =
            "password";


        if (icon) {

            icon.className =
                "fa-regular fa-eye";

        }

    }
}


/* ==========================================================
   SAFE JSON PARSE
========================================================== */

function safeParse(
    value,
    fallback = []
) {

    try {

        if (!value) {

            return fallback;

        }


        return JSON.parse(
            value
        );

    } catch (error) {

        console.error(
            "Storage error:",
            error
        );


        return fallback;

    }
}


/* ==========================================================
   USER STORAGE
========================================================== */

function getUsers() {

    return safeParse(

        localStorage.getItem(
            "secureGateUsers"
        ),

        []

    );
}


function saveUsers(users) {

    localStorage.setItem(

        "secureGateUsers",

        JSON.stringify(
            users
        )

    );
}


/* ==========================================================
   OTP REQUEST STORAGE
========================================================== */

function getRequests() {

    return safeParse(

        localStorage.getItem(
            "secureGateRequests"
        ),

        []

    );
}


function saveRequests(requests) {

    localStorage.setItem(

        "secureGateRequests",

        JSON.stringify(
            requests
        )

    );
}


/* ==========================================================
   PASSWORD VALIDATION
========================================================== */

function isStrongPassword(
    password
) {

    return (

        password.length >= 8

        &&

        /[A-Z]/.test(
            password
        )

        &&

        /[a-z]/.test(
            password
        )

        &&

        /\d/.test(
            password
        )

        &&

        /[^A-Za-z0-9]/.test(
            password
        )

    );
}


/* ==========================================================
   PASSWORD RULE DISPLAY
========================================================== */

function updatePasswordRule(
    elementId,
    valid
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    const icon =
        element.querySelector(
            "i"
        );


    if (valid) {

        element.classList.add(
            "valid"
        );


        if (icon) {

            icon.className =
                "fa-solid fa-circle-check";

        }

    } else {

        element.classList.remove(
            "valid"
        );


        if (icon) {

            icon.className =
                "fa-regular fa-circle";

        }

    }
}


/* ==========================================================
   SIGN UP
========================================================== */

function handleSignup(event) {

    event.preventDefault();


    const name =
        document
            .getElementById(
                "signupName"
            )
            ?.value
            .trim()
        || "";


    const email =
        document
            .getElementById(
                "signupEmail"
            )
            ?.value
            .trim()
            .toLowerCase()
        || "";


    const password =
        document
            .getElementById(
                "signupPassword"
            )
            ?.value
        || "";


    const message =
        document.getElementById(
            "signupMessage"
        );


    resetMessage(
        message
    );


    if (
        !name ||
        !email ||
        !password
    ) {

        setMessage(
            message,
            "Please complete all fields.",
            "error"
        );

        return;
    }


    if (
        !isStrongPassword(
            password
        )
    ) {

        setMessage(
            message,
            "Please create a strong password.",
            "error"
        );

        return;
    }


    const users =
        getUsers();


    const existingUser =
        users.find(
            user =>
                user.email ===
                email
        );


    if (
        existingUser
    ) {

        /*
            If an account was already created
            but has not yet been verified,
            return the user to its active OTP request.
        */

        if (
            !existingUser.verified
        ) {

            const requests =
                getRequests();


            const existingRequest =
                requests.find(

                    request =>

                        request.userId ===
                        existingUser.id

                        &&

                        request.type ===
                        "signup"

                        &&

                        request.status !==
                        "completed"

                        &&

                        request.status !==
                        "cancelled"

                );


            if (
                existingRequest
            ) {

                sessionStorage.setItem(
                    "currentUserRequest",
                    existingRequest.id
                );


                prepareWaitingPage(
                    existingRequest
                );


                showPage(
                    "waitingPage"
                );


                showToast(
                    "Your registration request is still active."
                );


                return;
            }

        }


        setMessage(
            message,
            "An account with this email already exists.",
            "error"
        );


        return;
    }


    /* CREATE USER */

    const user = {

        id:
            generateId(),

        name:
            name,

        email:
            email,

        password:
            password,

        role:
            "user",

        verified:
            false,

        createdAt:
            new Date()
                .toLocaleString()

    };


    users.push(
        user
    );


    saveUsers(
        users
    );


    /* CREATE OTP REQUEST */

    const requests =
        getRequests();


    const request = {

        id:
            generateId(),

        userId:
            user.id,

        name:
            user.name,

        email:
            user.email,

        type:
            "signup",

        status:
            "pending",

        otp:
            null,

        createdAt:
            new Date()
                .toLocaleString()

    };


    requests.push(
        request
    );


    saveRequests(
        requests
    );


    sessionStorage.setItem(
        "currentUserRequest",
        request.id
    );


    prepareWaitingPage(
        request
    );


    showPage(
        "waitingPage"
    );


    showToast(
        "Registration request sent to administrator."
    );
}


/* ==========================================================
   USER + ADMIN LOGIN
========================================================== */

function handleLogin(event) {

    event.preventDefault();


    const email =
        document
            .getElementById(
                "loginEmail"
            )
            ?.value
            .trim()
            .toLowerCase()
        || "";


    const password =
        document
            .getElementById(
                "loginPassword"
            )
            ?.value
        || "";


    const message =
        document.getElementById(
            "loginMessage"
        );


    resetMessage(
        message
    );


    /* ======================================================
       ADMIN LOGIN
    ====================================================== */

    if (

        email ===
        ADMIN_EMAIL

        &&

        password ===
        ADMIN_PASSWORD

    ) {

        sessionStorage.setItem(
            "adminLoggedIn",
            "true"
        );


        sessionStorage.removeItem(
            "loggedInUser"
        );


        sessionStorage.removeItem(
            "currentUserRequest"
        );


        showPage(
            "adminDashboardPage"
        );


        showToast(
            "Administrator login successful."
        );


        return;
    }


    /* ======================================================
       USER LOGIN
    ====================================================== */

    const users =
        getUsers();


    const user =
        users.find(

            item =>
                item.email ===
                email

        );


    if (!user) {

        setMessage(
            message,
            "No account found. Please sign up first.",
            "error"
        );


        return;
    }


    if (
        user.password !==
        password
    ) {

        setMessage(
            message,
            "Incorrect email or password.",
            "error"
        );


        return;
    }


    /* ======================================================
       USER STILL NEEDS SIGNUP VERIFICATION
    ====================================================== */

    if (
        !user.verified
    ) {

        const requests =
            getRequests();


        const signupRequest =
            requests.find(

                request =>

                    request.userId ===
                    user.id

                    &&

                    request.type ===
                    "signup"

                    &&

                    request.status !==
                    "completed"

                    &&

                    request.status !==
                    "cancelled"

            );


        if (
            signupRequest
        ) {

            sessionStorage.setItem(
                "currentUserRequest",
                signupRequest.id
            );


            prepareWaitingPage(
                signupRequest
            );


            showPage(
                "waitingPage"
            );


            showToast(
                "Your account still needs OTP verification."
            );


            return;
        }


        setMessage(
            message,
            "Your account has not been verified yet.",
            "error"
        );


        return;
    }


    /* ======================================================
       CREATE LOGIN OTP REQUEST
    ====================================================== */

    let requests =
        getRequests();


    /*
        Cancel unfinished previous login requests.
    */

    requests =
        requests.map(

            request => {

                if (

                    request.userId ===
                    user.id

                    &&

                    request.type ===
                    "login"

                    &&

                    request.status !==
                    "completed"

                ) {

                    return {

                        ...request,

                        status:
                            "cancelled"

                    };

                }


                return request;
            }

        );


    const request = {

        id:
            generateId(),

        userId:
            user.id,

        name:
            user.name,

        email:
            user.email,

        type:
            "login",

        status:
            "pending",

        otp:
            null,

        createdAt:
            new Date()
                .toLocaleString()

    };


    requests.push(
        request
    );


    saveRequests(
        requests
    );


    sessionStorage.setItem(
        "currentUserRequest",
        request.id
    );


    prepareWaitingPage(
        request
    );


    showPage(
        "waitingPage"
    );


    showToast(
        "Login OTP request sent to administrator."
    );
}


/* ==========================================================
   PREPARE WAITING PAGE
========================================================== */

function prepareWaitingPage(
    request
) {

    if (!request) {
        return;
    }


    setText(
        "waitingEmail",
        request.email
    );


    setText(

        "waitingType",

        request.type ===
        "signup"

            ?

            "Account Registration"

            :

            "Login Verification"

    );


    const waitingMessage =
        document.getElementById(
            "waitingMessage"
        );


    if (
        waitingMessage
    ) {

        if (
            request.type ===
            "signup"
        ) {

            waitingMessage.textContent =
                `${request.name}, your registration request has been sent to the administrator.`;

        } else {

            waitingMessage.textContent =
                `${request.name}, your login request has been sent to the administrator.`;

        }

    }


    const otpInput =
        document.getElementById(
            "waitingOtpInput"
        );


    if (
        otpInput
    ) {

        otpInput.value =
            "";

    }


    resetMessage(

        document.getElementById(
            "waitingOtpMessage"
        )

    );
}


/* ==========================================================
   CHECK OTP STATUS
   Kept for compatibility
========================================================== */

function checkOtpStatus() {

    const requestId =
        sessionStorage.getItem(
            "currentUserRequest"
        );


    if (!requestId) {

        showToast(
            "No active OTP request found."
        );

        return;
    }


    const requests =
        getRequests();


    const request =
        requests.find(

            item =>
                item.id ===
                requestId

        );


    if (!request) {

        showToast(
            "OTP request could not be found."
        );

        return;
    }


    if (
        request.status ===
        "cancelled"
    ) {

        showToast(
            "This request was cancelled. Please login again."
        );

        return;
    }


    if (
        request.status ===
        "completed"
    ) {

        showToast(
            "This request has already been completed."
        );

        return;
    }


    if (

        request.status ===
        "otp-generated"

        &&

        request.otp

    ) {

        setText(
            "otpUserEmail",
            request.email
        );


        const otpInput =
            document.getElementById(
                "otpInput"
            );


        if (otpInput) {

            otpInput.value =
                "";

        }


        showPage(
            "otpVerificationPage"
        );


        setTimeout(

            function () {

                document
                    .getElementById(
                        "otpInput"
                    )
                    ?.focus();

            },

            100

        );


        showToast(
            "Your OTP is ready."
        );


        return;
    }


    showToast(
        "The administrator has not generated your OTP yet."
    );
}


/* ==========================================================
   OTP INPUT
========================================================== */

function handleOtpInput(event) {

    event.target.value =

        event.target.value
            .replace(
                /\D/g,
                ""
            )
            .slice(
                0,
                4
            );
}


/* ==========================================================
   VERIFY OTP DIRECTLY FROM WAITING PAGE
========================================================== */

function handleWaitingOtpVerification(event) {

    event.preventDefault();


    const otpInput =
        document.getElementById(
            "waitingOtpInput"
        );


    const message =
        document.getElementById(
            "waitingOtpMessage"
        );


    const enteredOtp =
        otpInput
            ?.value
            .trim()
        || "";


    resetMessage(
        message
    );


    /* CHECK FORMAT */

    if (
        !/^\d{4}$/.test(
            enteredOtp
        )
    ) {

        setMessage(
            message,
            "Please enter the complete 4-digit OTP.",
            "error"
        );

        return;
    }


    /* GET CURRENT REQUEST */

    const requestId =
        sessionStorage.getItem(
            "currentUserRequest"
        );


    if (!requestId) {

        setMessage(
            message,
            "No active OTP request found. Please login again.",
            "error"
        );

        return;
    }


    let requests =
        getRequests();


    const requestIndex =
        requests.findIndex(

            request =>
                request.id ===
                requestId

        );


    if (
        requestIndex === -1
    ) {

        setMessage(
            message,
            "OTP request could not be found.",
            "error"
        );

        return;
    }


    const request =
        requests[
            requestIndex
        ];


    /* CANCELLED */

    if (
        request.status ===
        "cancelled"
    ) {

        setMessage(
            message,
            "This OTP request was cancelled. Please login again.",
            "error"
        );

        return;
    }


    /* COMPLETED */

    if (
        request.status ===
        "completed"
    ) {

        setMessage(
            message,
            "This OTP has already been used. Please login again.",
            "error"
        );

        return;
    }


    /* OTP NOT GENERATED */

    if (

        request.status !==
        "otp-generated"

        ||

        !request.otp

    ) {

        setMessage(
            message,
            "The administrator has not generated your OTP yet.",
            "error"
        );

        return;
    }


    /* WRONG OTP */

    if (
        enteredOtp !==
        String(
            request.otp
        )
    ) {

        setMessage(
            message,
            "Incorrect OTP. Please try again.",
            "error"
        );

        return;
    }


    /* FIND USER */

    let users =
        getUsers();


    const userIndex =
        users.findIndex(

            user =>
                user.id ===
                request.userId

        );


    if (
        userIndex === -1
    ) {

        setMessage(
            message,
            "User account could not be found.",
            "error"
        );

        return;
    }


    /* VERIFY NEW ACCOUNT */

    if (
        request.type ===
        "signup"
    ) {

        users[
            userIndex
        ].verified =
            true;


        users[
            userIndex
        ].verifiedAt =
            new Date()
                .toLocaleString();


        saveUsers(
            users
        );

    }


    /* COMPLETE OTP REQUEST */

    request.status =
        "completed";


    request.completedAt =
        new Date()
            .toLocaleString();


    requests[
        requestIndex
    ] =
        request;


    saveRequests(
        requests
    );


    /* LOGIN USER */

    const user =
        users[
            userIndex
        ];


    sessionStorage.setItem(
        "loggedInUser",
        user.id
    );


    sessionStorage.removeItem(
        "adminLoggedIn"
    );


    sessionStorage.removeItem(
        "currentUserRequest"
    );


    loadUserDashboard(
        user
    );


    if (
        otpInput
    ) {

        otpInput.value =
            "";

    }


    showPage(
        "userDashboardPage"
    );


    if (
        request.type ===
        "signup"
    ) {

        showToast(
            "Account verified successfully!"
        );

    } else {

        showToast(
            "Login verified successfully!"
        );

    }
}


/* ==========================================================
   OLD OTP PAGE VERIFICATION
========================================================== */

function handleOtpVerification(event) {

    event.preventDefault();


    const otpInput =
        document.getElementById(
            "otpInput"
        );


    const message =
        document.getElementById(
            "otpMessage"
        );


    const enteredOtp =
        otpInput
            ?.value
            .trim()
        || "";


    resetMessage(
        message
    );


    if (
        !/^\d{4}$/.test(
            enteredOtp
        )
    ) {

        setMessage(
            message,
            "Please enter the complete 4-digit OTP.",
            "error"
        );

        return;
    }


    const requestId =
        sessionStorage.getItem(
            "currentUserRequest"
        );


    if (!requestId) {

        setMessage(
            message,
            "No active OTP request found.",
            "error"
        );

        return;
    }


    let requests =
        getRequests();


    const requestIndex =
        requests.findIndex(

            request =>
                request.id ===
                requestId

        );


    if (
        requestIndex === -1
    ) {

        setMessage(
            message,
            "OTP request could not be found.",
            "error"
        );

        return;
    }


    const request =
        requests[
            requestIndex
        ];


    if (

        request.status !==
        "otp-generated"

        ||

        !request.otp

    ) {

        setMessage(
            message,
            "The administrator has not generated an OTP yet.",
            "error"
        );

        return;
    }


    if (
        enteredOtp !==
        String(
            request.otp
        )
    ) {

        setMessage(
            message,
            "Incorrect OTP. Please try again.",
            "error"
        );

        return;
    }


    let users =
        getUsers();


    const userIndex =
        users.findIndex(

            user =>
                user.id ===
                request.userId

        );


    if (
        userIndex === -1
    ) {

        setMessage(
            message,
            "User account could not be found.",
            "error"
        );

        return;
    }


    if (
        request.type ===
        "signup"
    ) {

        users[
            userIndex
        ].verified =
            true;


        users[
            userIndex
        ].verifiedAt =
            new Date()
                .toLocaleString();


        saveUsers(
            users
        );

    }


    request.status =
        "completed";


    request.completedAt =
        new Date()
            .toLocaleString();


    requests[
        requestIndex
    ] =
        request;


    saveRequests(
        requests
    );


    const user =
        users[
            userIndex
        ];


    sessionStorage.setItem(
        "loggedInUser",
        user.id
    );


    sessionStorage.removeItem(
        "adminLoggedIn"
    );


    sessionStorage.removeItem(
        "currentUserRequest"
    );


    loadUserDashboard(
        user
    );


    if (
        otpInput
    ) {

        otpInput.value =
            "";

    }


    showPage(
        "userDashboardPage"
    );


    if (
        request.type ===
        "signup"
    ) {

        showToast(
            "Account verified successfully!"
        );

    } else {

        showToast(
            "Login verified successfully!"
        );

    }
}


/* ==========================================================
   LOAD USER DASHBOARD
========================================================== */

function loadUserDashboard(
    user
) {

    if (!user) {
        return;
    }


    setText(
        "simpleDashboardName",
        user.name || "User"
    );
}


/* ==========================================================
   USER LOGOUT
========================================================== */

function userLogout() {

    sessionStorage.removeItem(
        "loggedInUser"
    );


    sessionStorage.removeItem(
        "currentUserRequest"
    );


    showPage(
        "authPage"
    );


    openTab(
        "login"
    );


    const loginForm =
        document.getElementById(
            "loginForm"
        );


    loginForm
        ?.reset();


    showToast(
        "You have been logged out."
    );
}


/* ==========================================================
   ADMIN LOGOUT
========================================================== */

function adminLogout() {

    sessionStorage.removeItem(
        "adminLoggedIn"
    );


    showPage(
        "authPage"
    );


    openTab(
        "login"
    );


    showToast(
        "Administrator logged out."
    );
}


/* ==========================================================
   ADMIN DASHBOARD
========================================================== */

function renderAdminDashboard() {

    const users =
        getUsers();


    const requests =
        getRequests();


    const activeRequests =
        requests.filter(

            request =>

                request.status ===
                "pending"

                ||

                request.status ===
                "otp-generated"

        );


    const pendingRequests =
        requests.filter(

            request =>
                request.status ===
                "pending"

        );


    const verifiedUsers =
        users.filter(

            user =>
                user.verified

        );


    setText(
        "totalUsersCount",
        users.length
    );


    setText(
        "pendingCount",
        pendingRequests.length
    );


    setText(
        "verifiedCount",
        verifiedUsers.length
    );


    setText(
        "sidebarRequestCount",
        activeRequests.length
    );


    renderOtpRequests(
        activeRequests
    );


    renderUsersTable(
        users
    );
}


/* ==========================================================
   RENDER OTP REQUESTS
========================================================== */

function renderOtpRequests(
    requests
) {

    const container =
        document.getElementById(
            "otpRequestsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (
        requests.length === 0
    ) {

        container.innerHTML = `

            <div class="no-requests">

                <i class="fa-regular fa-circle-check"></i>

                <strong>
                    No active OTP requests
                </strong>

                <p>
                    New authentication requests will appear here.
                </p>

            </div>

        `;


        return;
    }


    requests.forEach(

        request => {


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "request-card";


            const isGenerated =
                request.status ===
                "otp-generated";


            const title =

                request.type ===
                "signup"

                    ?

                    `${escapeHtml(
                        request.name
                    )} is signing up`

                    :

                    `${escapeHtml(
                        request.name
                    )} is requesting to log in`;


            const description =

                request.type ===
                "signup"

                    ?

                    "This user created a new account and needs an OTP."

                    :

                    "This registered user entered their password and needs a login OTP.";


            card.innerHTML = `

                <div class="request-user-icon">

                    <i class="fa-solid fa-user"></i>

                </div>


                <div class="request-info">

                    <h3>
                        ${title}
                    </h3>


                    <p>
                        ${description}
                    </p>


                    <p
                        style="
                            margin-top:6px;
                            font-weight:600;
                        "
                    >

                        <i class="fa-regular fa-envelope"></i>

                        ${escapeHtml(
                            request.email
                        )}

                    </p>


                    <div class="request-meta">

                        <span class="request-type">

                            ${
                                request.type ===
                                "signup"

                                    ?

                                    "Sign Up"

                                    :

                                    "Login"
                            }

                        </span>


                        <span>

                            ${
                                escapeHtml(
                                    request.createdAt
                                )
                            }

                        </span>

                    </div>

                </div>


                <button
                    type="button"
                    class="generate-button"
                    onclick="${
                        isGenerated

                            ?

                            `viewGeneratedOtp('${request.id}')`

                            :

                            `generateOtpForUser('${request.id}')`
                    }"
                >

                    <i class="fa-solid fa-key"></i>

                    ${
                        isGenerated

                            ?

                            "View OTP"

                            :

                            "Generate OTP"
                    }

                </button>

            `;


            container.appendChild(
                card
            );

        }

    );
}


/* ==========================================================
   GENERATE OTP
========================================================== */

function generateOtpForUser(
    requestId
) {

    let requests =
        getRequests();


    const requestIndex =
        requests.findIndex(

            request =>
                request.id ===
                requestId

        );


    if (
        requestIndex === -1
    ) {

        showToast(
            "OTP request could not be found."
        );

        return;
    }


    const request =
        requests[
            requestIndex
        ];


    if (
        request.status ===
        "completed"
    ) {

        showToast(
            "This OTP request has already been completed."
        );

        return;
    }


    if (
        request.status ===
        "cancelled"
    ) {

        showToast(
            "This OTP request was cancelled."
        );

        return;
    }


    const otp =
        Math.floor(
            1000 +
            Math.random() * 9000
        )
        .toString();


    requests[
        requestIndex
    ].otp =
        otp;


    requests[
        requestIndex
    ].status =
        "otp-generated";


    requests[
        requestIndex
    ].generatedAt =
        new Date()
            .toLocaleString();


    saveRequests(
        requests
    );


    const updatedRequest =
        requests[
            requestIndex
        ];


    openOtpModal(
        updatedRequest
    );


    renderAdminDashboard();


    showToast(
        `OTP generated for ${updatedRequest.name}.`
    );
}


/* ==========================================================
   VIEW GENERATED OTP
========================================================== */

function viewGeneratedOtp(
    requestId
) {

    const request =
        getRequests().find(

            item =>
                item.id ===
                requestId

        );


    if (

        !request

        ||

        !request.otp

    ) {

        showToast(
            "Generated OTP could not be found."
        );

        return;
    }


    openOtpModal(
        request
    );
}


/* ==========================================================
   OPEN OTP MODAL
========================================================== */

function openOtpModal(
    request
) {

    setText(
        "modalUserName",
        request.name
    );


    setText(
        "modalUserEmail",
        request.email
    );


    setText(
        "modalOtpCode",
        request.otp || "----"
    );


    document
        .getElementById(
            "otpModal"
        )
        ?.classList
        .add(
            "active"
        );
}


/* ==========================================================
   CLOSE OTP MODAL
========================================================== */

function closeOtpModal() {

    document
        .getElementById(
            "otpModal"
        )
        ?.classList
        .remove(
            "active"
        );
}


/* ==========================================================
   REGISTERED USERS TABLE
========================================================== */

function renderUsersTable(
    users
) {

    const tbody =
        document.getElementById(
            "usersTableBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML =
        "";


    if (
        users.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="4">

                    No registered users yet.

                </td>

            </tr>

        `;


        return;
    }


    users.forEach(

        user => {


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <div class="table-user">

                        <div class="table-avatar">

                            ${escapeHtml(
                                user.name
                                    ?.charAt(0)
                                    ?.toUpperCase()
                                || "U"
                            )}

                        </div>


                        <strong>

                            ${escapeHtml(
                                user.name
                            )}

                        </strong>

                    </div>

                </td>


                <td>

                    ${escapeHtml(
                        user.email
                    )}

                </td>


                <td>

                    <span
                        class="
                            status-badge
                            ${
                                user.verified

                                    ?

                                    "verified"

                                    :

                                    "pending"
                            }
                        "
                    >

                        ${
                            user.verified

                                ?

                                "Verified"

                                :

                                "Pending"
                        }

                    </span>

                </td>


                <td>

                    ${escapeHtml(
                        user.createdAt
                    )}

                </td>

            `;


            tbody.appendChild(
                row
            );

        }

    );
}


/* ==========================================================
   GENERATE UNIQUE ID
========================================================== */

function generateId() {

    return (

        Date.now()
            .toString(36)

        +

        Math.random()
            .toString(36)
            .substring(
                2,
                10
            )

    );
}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHtml(
    value
) {

    const text =
        String(
            value ?? ""
        );


    return text
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* ==========================================================
   SET TEXT
========================================================== */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (
        element
    ) {

        element.textContent =
            value;

    }
}


/* ==========================================================
   CLEAR FORM MESSAGES
========================================================== */

function clearFormMessages() {

    resetMessage(
        document.getElementById(
            "loginMessage"
        )
    );


    resetMessage(
        document.getElementById(
            "signupMessage"
        )
    );


    resetMessage(
        document.getElementById(
            "otpMessage"
        )
    );


    resetMessage(
        document.getElementById(
            "waitingOtpMessage"
        )
    );
}


/* ==========================================================
   RESET MESSAGE
========================================================== */

function resetMessage(
    element
) {

    if (!element) {
        return;
    }


    element.textContent =
        "";


    element.classList.remove(
        "error",
        "success"
    );
}


/* ==========================================================
   SET MESSAGE
========================================================== */

function setMessage(
    element,
    message,
    type
) {

    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.classList.remove(
        "error",
        "success"
    );


    if (
        type
    ) {

        element.classList.add(
            type
        );

    }
}


/* ==========================================================
   TOAST
========================================================== */

let toastTimer =
    null;


function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (
        !toast ||
        !toastMessage
    ) {

        return;
    }


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(

            function () {

                toast.classList.remove(
                    "show"
                );

            },

            3000

        );
}


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    function () {


        const signupPassword =
            document.getElementById(
                "signupPassword"
            );


        const signupForm =
            document.getElementById(
                "signupForm"
            );


        const loginForm =
            document.getElementById(
                "loginForm"
            );


        const otpForm =
            document.getElementById(
                "otpForm"
            );


        const otpInput =
            document.getElementById(
                "otpInput"
            );


        /*
            IMPORTANT FIX:

            These two elements are the OTP form
            and OTP input located directly on
            the waiting page.
        */

        const waitingOtpForm =
            document.getElementById(
                "waitingOtpForm"
            );


        const waitingOtpInput =
            document.getElementById(
                "waitingOtpInput"
            );


        /* ==================================================
           PASSWORD REQUIREMENTS
        ================================================== */

        signupPassword
            ?.addEventListener(

                "input",

                function () {


                    const password =
                        signupPassword.value;


                    updatePasswordRule(
                        "ruleLength",
                        password.length >= 8
                    );


                    updatePasswordRule(
                        "ruleUpper",
                        /[A-Z]/.test(
                            password
                        )
                    );


                    updatePasswordRule(
                        "ruleLower",
                        /[a-z]/.test(
                            password
                        )
                    );


                    updatePasswordRule(
                        "ruleNumber",
                        /\d/.test(
                            password
                        )
                    );


                    updatePasswordRule(
                        "ruleSpecial",
                        /[^A-Za-z0-9]/.test(
                            password
                        )
                    );

                }

            );


        /* ==================================================
           FORM EVENTS
        ================================================== */

        signupForm
            ?.addEventListener(
                "submit",
                handleSignup
            );


        loginForm
            ?.addEventListener(
                "submit",
                handleLogin
            );


        /*
            OLD OTP PAGE
        */

        otpInput
            ?.addEventListener(
                "input",
                handleOtpInput
            );


        otpForm
            ?.addEventListener(
                "submit",
                handleOtpVerification
            );


        /*
            ==================================================
            IMPORTANT FIX

            The new OTP input and form on the
            waiting page must have their own
            event listeners.

            Without these, clicking Verify OTP
            does absolutely nothing.
            ==================================================
        */

        waitingOtpInput
            ?.addEventListener(
                "input",
                handleOtpInput
            );


        waitingOtpForm
            ?.addEventListener(
                "submit",
                handleWaitingOtpVerification
            );


        /* ==================================================
           RESTORE ADMIN SESSION
        ================================================== */

        const adminLoggedIn =
            sessionStorage.getItem(
                "adminLoggedIn"
            ) === "true";


        if (
            adminLoggedIn
        ) {

            showPage(
                "adminDashboardPage"
            );


            return;
        }


        /* ==================================================
           RESTORE USER SESSION
        ================================================== */

        const loggedInUserId =
            sessionStorage.getItem(
                "loggedInUser"
            );


        if (
            loggedInUserId
        ) {

            const users =
                getUsers();


            const user =
                users.find(

                    item =>
                        item.id ===
                        loggedInUserId

                );


            if (
                user
            ) {

                loadUserDashboard(
                    user
                );


                showPage(
                    "userDashboardPage"
                );


                return;

            } else {

                sessionStorage.removeItem(
                    "loggedInUser"
                );

            }

        }


        /* ==================================================
           RESTORE ACTIVE OTP REQUEST
        ================================================== */

        const requestId =
            sessionStorage.getItem(
                "currentUserRequest"
            );


        if (
            requestId
        ) {

            const request =
                getRequests().find(

                    item =>
                        item.id ===
                        requestId

                );


            if (

                request

                &&

                request.status !==
                "completed"

                &&

                request.status !==
                "cancelled"

            ) {

                prepareWaitingPage(
                    request
                );


                showPage(
                    "waitingPage"
                );


                return;

            } else {

                sessionStorage.removeItem(
                    "currentUserRequest"
                );

            }

        }


        /* DEFAULT PAGE */

        showPage(
            "authPage"
        );


        openTab(
            "login"
        );

    }

);


/* ==========================================================
   UPDATE ADMIN DASHBOARD ACROSS BROWSER TABS
========================================================== */

window.addEventListener(

    "storage",

    function (event) {


        if (

            event.key ===
            "secureGateUsers"

            ||

            event.key ===
            "secureGateRequests"

        ) {


            const adminLoggedIn =
                sessionStorage.getItem(
                    "adminLoggedIn"
                ) === "true";


            if (
                adminLoggedIn
            ) {

                renderAdminDashboard();

            }


            /*
                If the user is currently on
                the OTP waiting page, keep
                their request information synced.
            */

            const requestId =
                sessionStorage.getItem(
                    "currentUserRequest"
                );


            if (
                requestId
            ) {

                const request =
                    getRequests().find(

                        item =>
                            item.id ===
                            requestId

                    );


                if (

                    request

                    &&

                    request.status ===
                    "otp-generated"

                ) {

                    const waitingMessage =
                        document.getElementById(
                            "waitingOtpMessage"
                        );


                    if (
                        waitingMessage
                    ) {

                        setMessage(
                            waitingMessage,
                            "Your OTP is ready. Enter the 4-digit code provided by the administrator.",
                            "success"
                        );

                    }

                }

            }

        }

    }

);