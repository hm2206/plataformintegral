import React from 'react';
import Router from 'next/router';

const useCurrentRoute = () => {

    // verificar si ruta es la actual
    const vefiryRoute = (path, verify = Router.pathname) => {
        let current_path = `${path}`.toLowerCase();
        let pattern = new RegExp(`${current_path}\/?[a-zA-Z0-9_\-]+`);
        let is_current = `${verify}`.match(pattern);
        // response
        return [is_current ? true : false,  is_current ? is_current[0] : null ];
    }

    // hooks
    return { vefiryRoute };
}

export default useCurrentRoute;