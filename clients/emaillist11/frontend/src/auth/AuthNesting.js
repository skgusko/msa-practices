import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from './AuthContextProvider';
import { jwtDecode } from 'jwt-decode';

export const AuthRequired = () => {
    const {tokenHolder} = useAuthContext();
    const token = tokenHolder.accessToken;

    if(!token) {
        location.href = AUTHORIZATION_ENDPOINT;
        return;
    }

    const claims = jwtDecode(token);
    
    return <Outlet context={{
        username: claims.preferred_username,
        roles: claims.resource_access.emaillist.roles
    }}/>; 
}

export const AuthNotRequired = () => {
    const {tokenHolder} = useAuthContext();
    const token = tokenHolder.accessToken;

    return token ? <Navigate to="/" /> : <Outlet />
}