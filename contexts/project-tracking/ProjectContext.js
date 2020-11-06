import React, { createContext } from 'react';


// definiendo context
export const ProjectContext = createContext();


// exportando provedores
export const ProjectProvider = ProjectContext.Provider;


// exportando consumers
export const ProjectConsumer = ProjectContext.Consumer;
