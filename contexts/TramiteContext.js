import React, { createContext } from 'react';

// definiendo context
export const TramiteContext = createContext();


// exportando provedores
export const TramiteProvider = TramiteContext.Provider;


// exportando consumers
export const TramiteConsumer = TramiteContext.Consumer;