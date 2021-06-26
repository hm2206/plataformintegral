import React, { createContext, useReducer, useState } from 'react';
import { initialStates, AssistanceReducer } from './AssistanceReducer';

export const AssistanceContext = createContext();

export const AssistanceProvider = ({ children, value = {} }) => {

    // reducer
    const [state, dispatch] = useReducer(AssistanceReducer, initialStates);

    // estados 
    const [month, setMonth] = useState();
    const [year, setYear] = useState();
    const [day, setDay] = useState();
    const [query_search, setQuerySearch] = useState("");

    // render
    return (
        <AssistanceContext.Provider value={{ ...state, dispatch, year, setYear, month, setMonth, day, setDay, query_search, setQuerySearch, ...value }}>
            {children}
        </AssistanceContext.Provider>
    )
}