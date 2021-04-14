import React, { createContext, useReducer } from 'react';
import { Reducer, initialState } from './GroupReducer';

export const GroupContext = createContext();

export const GroupProvider = ({ group, children }) => {

    // reducer
    const [state, dispatch] = useReducer(Reducer, initialState);

    // render 
    return (
        <GroupContext.Provider value={{ group, ...state, dispatch }}>
            {children}
        </GroupContext.Provider>
    );
}