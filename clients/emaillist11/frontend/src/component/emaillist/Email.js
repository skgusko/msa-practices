import React from 'react';
import {useOutletContext} from 'react-router';
import {_Email} from '../../assets/scss/Email.scss';

function Email({id, firstName, lastName, email, deleteEmail}) {
    const {roles} = useOutletContext();

    return (
        <li className={_Email}>
            <h4>{firstName} {lastName}</h4>
            <span>{email}</span>
            {
                roles.includes("WRITE") ? 
                    <a onClick={(event) => {
                        event.preventDefault();
                        deleteEmail(id);
                    }} />
                    :
                    null
            }
        </li>
    );
}

export default Email;