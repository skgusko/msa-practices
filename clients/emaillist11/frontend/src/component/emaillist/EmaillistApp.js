import React, {useState, useEffect} from 'react';
import {useOutletContext} from 'react-router';
import {useAuthContext, useAuthFetch} from '../../auth';
import RegisterForm from './RegisterForm';
import SearchBar from './SearchBar';
import Emaillist from './Emaillist';
import Header from './Header';

function EmaillistApp() {
    const {storeToken} = useAuthContext();
    const {username, roles} = useOutletContext();
    const [emails, setEmails] = useState(null);

    const addEmail = useAuthFetch(API_BASE_ENDPOINT, {method: 'post'});
    const fetchEmails = useAuthFetch(API_BASE_ENDPOINT);
    const logout = useAuthFetch('/logout', null, false);
    const deleteEmail = useAuthFetch(API_BASE_ENDPOINT, {method: 'delete'});

    useEffect(() => {
        fetchEmails().then(json => setEmails(json.data));
    }, []);

    return (
        <div id={'App'}>
            <Header
                name={username}
                logout={async () => {
                    await logout();
                    storeToken(null, true);
                }} />
            {  
                roles.includes("WRITE") ?  
                    <RegisterForm addEmail={async (email) => {
                        const jsonResult = await addEmail(email);
                        setEmails([jsonResult.data, ...emails]);
                    }} /> :
                    null
            }
            <SearchBar fetchEmails={async (keyword) => {
                const jsonResult = await fetchEmails({kw: keyword});
                setEmails(jsonResult.data);
            }}/>
            { 
                emails !== null ? 
                    <Emaillist
                        emails={emails}
                        deleteEmail={async (id) => {
                            const jsonResult = await deleteEmail(id);
                            setEmails(emails.filter(e => e.id !== jsonResult.data));
                        }} /> :
                    null
            }
        </div>
    );
}

export default EmaillistApp;