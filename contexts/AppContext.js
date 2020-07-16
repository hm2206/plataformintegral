import React, { createContext } from 'react';


// definiendo context
export const AppContext = createContext();
export const LoadingContext = createContext();


// exportando provedores
export const AppProvider = AppContext.Provider;
export const LoadingProvider = LoadingContext.Provider;


// exportando consumers
export const AppConsumer = AppContext.Consumer;
export const LoadingConsumer = LoadingContext.Consumer;
