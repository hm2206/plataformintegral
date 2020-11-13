import React, { createContext } from 'react';


// definiendo context
export const TrackingContext = createContext();


// exportando provedores
export const TrackingProvider = TrackingContext.Provider;


// exportando consumers
export const TrackingConsumer = TrackingContext.Consumer;
