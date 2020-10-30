import React, { createContext } from 'react';


// definiendo context
export const CronogramaContext = createContext();


// exportando provedores
export const CronogramaProvider = CronogramaContext.Provider;


// exportando consumers
export const CronogramaConsumer = CronogramaContext.Consumer;
