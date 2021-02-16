import React, { createContext } from 'react';

// definiendo context
export const SignatureContext = createContext();
export const SignatureProvider = SignatureContext.Provider;
export const SignatureConsumer = SignatureContext.Consumer;

// definiendo group
export const GroupContext = createContext();
export const GroupProvider = GroupContext.Provider;
export const GroupConsumer = GroupContext.Consumer;