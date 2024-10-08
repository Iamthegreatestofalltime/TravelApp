import React, { createContext, useState } from 'react';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [username, setUsername] = useState('');
    const [id, setId] = useState('');
    const [token, setToken] = useState('');

    return (
        <UserContext.Provider value={{ username, setUsername, id, setId, token, setToken }}>
            {children}
        </UserContext.Provider>
    );
};