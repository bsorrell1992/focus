import React, { useState, useEffect, useCallback, useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'react-bootstrap/Button';
import { loginCreators } from '../../store/login_api';

import './login.css';

const LoginView = () => {
    const dispatch = useDispatch();

    const loginAPI = useSelector((state) => state.loginAPI);


const handleSignIn = () => {

    const action = loginCreators.login();
    dispatch(action);

};

const handleSignOut = () => {

    const action = loginCreators.logout();
    dispatch(action);

};

return(
    <div>

    {loginAPI.loggedIn ? <Button id="signOutButton" onClick={handleSignOut}>Sign Out</Button>
    :
    <Button id="signInButton" onClick={handleSignIn}>Sign In</Button>}
    </div>
)
}

export default LoginView;