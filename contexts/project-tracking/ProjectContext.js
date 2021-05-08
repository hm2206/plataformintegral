import React, { createContext, useEffect, useReducer, useState } from 'react';
import { inititalStates, projectReducer, projectTypes } from './ProjectReducer';


// definiendo context
export const ProjectContext = createContext();


// exportando provedores
export const ProjectProvider = ({ children = null, project = {} }) => {

    // estados
    const [edit, setEdit] = useState(false);

    // reducer
    const [state, dispatch] = useReducer(projectReducer, inititalStates);

    // setting project
    useEffect(() => {
        dispatch({ type: projectTypes.SET_PROJECT, payload: project });
    }, [project]);

    // render
    return (
        <ProjectContext.Provider value={{ ...state, dispatch, setEdit, edit }}>
            {children}
        </ProjectContext.Provider>
    )
}
