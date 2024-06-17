import Account from "../models/account";
import {Request, Response, RequestHandler} from "express";

// Authentication Context
// const AuthContext = React.createContext(null);


function checkAuthentication() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {

        // Redirect to login/signup page
        window.location.href = '/create-account-or-sign-in';  // note: adjust this later if the route changes
    }
}


// get availability of provider


