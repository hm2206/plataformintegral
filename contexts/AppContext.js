import React, { createContext } from 'react';


// definiendo context
export const AppContext = createContext();


// exportando provedores
export const AppProvider = AppContext.Provider;


// exportando consumers
export const AppConsumer = AppContext.Consumer;
