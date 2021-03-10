import React, { useState } from 'react';

const useAuth = () => {

    // estados
    const [auth, setAuth] = useState({});
    const [is_logging, setIsLogging] = useState(false);

    // exportar
    return { auth, is_logging };
}

export default useAuth;