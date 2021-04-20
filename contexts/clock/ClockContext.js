import React, { createContext } from 'react';

export const ClockContext = createContext();

export const ClockProvider = ({ children }) => {

    // render
    return (
        <ClockContext.Provider>
            {children}
        </ClockContext.Provider>
    )
}