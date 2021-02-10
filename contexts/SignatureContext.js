import React, { createContext } from 'react';

// definiendo context
export const SignatureContext = createContext();


// exportando provedores
export const SignatureProvider = SignatureContext.Provider;


// exportando consumers
export const SignatureConsumer = SignatureContext.Consumer;