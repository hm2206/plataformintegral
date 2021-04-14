import React, { createContext } from 'react';

// definiendo context
export const SignatureContext = createContext();
export const SignatureProvider = SignatureContext.Provider;
export const SignatureConsumer = SignatureContext.Consumer;