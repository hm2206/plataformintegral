import React, { createContext, useEffect, useReducer } from 'react';
import { initialStates, AssistanceReducer } from './AssistanceReducer';

export const AssistanceContext = createContext();

export const AssistanceProvider = ({ children }) => {

    // reducer
    const [state, dispatch] = useReducer(AssistanceReducer, initialStates);

    // render
    return (
        <AssistanceContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AssistanceContext.Provider>
    )
}