import axios from 'axios';
import Cookies from 'js-cookie';
import NextCookies from 'next-cookies';
import Swal from 'sweetalert2';


let headers = async () => ({
    Authorization: `Bearer ${await Cookies.get('auth_token')}`,
    EntityId: `${await Cookies.get('EntityId') || '__error'}`
});

export const configAuthorization = (ctx) => {
    return `Bearer ${NextCookies(ctx)['auth_token']}`;
}

export const configEntityId = (ctx) => {
    return NextCookies(ctx)['EntityId'];
}

const ConfigHeaders = async (ctx = null, config = { }) => {
    let newConfig = Object.assign({}, config);
    newConfig.headers = config.headers || {};
    // add credenciales
    newConfig.headers.ClientId = process?.env?.NEXT_PUBLIC_CLIENT_ID || '';
    newConfig.headers.ClientSecret = process?.env?.NEXT_PUBLIC_CLIENT_SECRET || '';
    // validar ctx
    if (ctx) {
        newConfig.headers.Authorization = await configAuthorization(ctx);
        newConfig.headers.EntityId = await configEntityId(ctx) || "__error" ;
    } else {
        let clientHeaders = await headers();
        newConfig.headers.Authorization = clientHeaders.Authorization
        newConfig.headers.EntityId = clientHeaders.EntityId || "__error";
    };
    // response
    return newConfig;
}   

/**
 * token de cancelación
 */
export const CancelRequest = () => axios.CancelToken.source();

/**
 * upload y download
 */
export const onProgress = (progressEvent, callback = null) => {
    const { loaded, total } = progressEvent;
    let percent = Math.floor(loaded * 100 / total);
    return typeof callback == 'function' ? callback(percent) : callback;
} 


/**
 * Manejador de error de axíos
 * @param {*} err 
 * @param {*} callback 
 */
export const handleErrorRequest = (err, callback = null, custom = null) => {
    try {
        if (typeof custom == 'function') custom(err);
        let { data } = err.response || {};
        if (typeof data != 'object') throw new Error(err.message);
        if (typeof data.errors != 'object') throw new Error(data.message || err.message);
        Swal.fire({ icon: 'warning', text: data.message || err.message });
        return typeof callback == 'function' ? callback(data.errors || {}) : null;
    } catch (error) {
        Swal.fire({ icon: 'error', text: error.message });
    }
}

/**
 *  api para consumir el authenticador
 */
export const authentication = {
    get: async (path, config = { }, ctx = null) => {
        return axios.get(`${process?.env?.NEXT_PUBLIC_AUTHENTICATION}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx = null) => {
        return axios.post(`${process?.env?.NEXT_PUBLIC_AUTHENTICATION}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    path: process?.env?.NEXT_PUBLIC_AUTHENTICATION
};


/**
 * api para consumir el sistema de planillas
 */
export const unujobs = {
    get: async (path, config = { }, ctx) => {
        return axios.get(`${process?.env?.NEXT_PUBLIC_UNUJOBS}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${process?.env?.NEXT_PUBLIC_UNUJOBS}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${process?.env?.NEXT_PUBLIC_UNUJOBS}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: process?.env?.NEXT_PUBLIC_UNUJOBS
};

/**
 * api para consumir el sistema de micro-scale
 */
 export const microAuth = {
    get: async (path, config = { }, ctx) => {
        return axios.get(`${process?.env?.NEXT_PUBLIC_MICRO_AUTH}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${process?.env?.NEXT_PUBLIC_MICRO_AUTH}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    put: async (path, body = { }, config = { }, ctx) => {
        return axios.put(`${process?.env?.NEXT_PUBLIC_MICRO_AUTH}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    delete: async (path, config = { }, ctx) => {
        return axios.delete(`${process?.env?.NEXT_PUBLIC_MICRO_AUTH}/${path}`, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${process?.env?.NEXT_PUBLIC_MICRO_AUTH}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: process?.env?.NEXT_PUBLIC_MICRO_AUTH
};


/**
 * api para consumir el sistema de micro-scale
 */
 export const microScale = {
    get: async (path, config = { }, ctx) => {
        return axios.get(`${process?.env?.NEXT_PUBLIC_MICRO_SCALE}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${process?.env?.NEXT_PUBLIC_MICRO_SCALE}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    put: async (path, body = { }, config = { }, ctx) => {
        return axios.put(`${process?.env?.NEXT_PUBLIC_MICRO_SCALE}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    delete: async (path, config = { }, ctx) => {
        return axios.delete(`${process?.env?.NEXT_PUBLIC_MICRO_SCALE}/${path}`, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${process?.env?.NEXT_PUBLIC_MICRO_SCALE}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: process?.env?.NEXT_PUBLIC_MICRO_SCALE
};


/**
 * api para consumir el sistema de micro-planilla
 */
 export const microPlanilla = {
    get: async (path, config = { }, ctx) => {
        return axios.get(`${process?.env?.NEXT_PUBLIC_MICRO_PLANILLA}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${process?.env?.NEXT_PUBLIC_MICRO_PLANILLA}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    put: async (path, body = { }, config = { }, ctx) => {
        return axios.put(`${process?.env?.NEXT_PUBLIC_MICRO_PLANILLA}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    delete: async (path, config = { }, ctx) => {
        return axios.delete(`${process?.env?.NEXT_PUBLIC_MICRO_PLANILLA}/${path}`, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${process?.env?.NEXT_PUBLIC_MICRO_PLANILLA}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: process?.env?.NEXT_PUBLIC_MICRO_PLANILLA
};


/**
 * api para consumir el sistema de escalafón
 */
export const escalafon = {
    get: async (path, config = { }, ctx) => {
        return axios.get(`${process?.env?.NEXT_PUBLIC_MICRO_PLANILLA}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${process?.env?.NEXT_PUBLIC_MICRO_PLANILLA}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${process?.env?.NEXT_PUBLIC_MICRO_PLANILLA}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: process?.env?.NEXT_PUBLIC_MICRO_PLANILLA
};

/**
 * api para consumir el sistema de Recursos humanos
 */
export const recursoshumanos = {
    get: async (path, config = { }, ctx) => {
        return axios.get(`${process?.env?.NEXT_PUBLIC_RECURSOSHUMANOS}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${process?.env?.NEXT_PUBLIC_RECURSOSHUMANOS}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${process?.env?.NEXT_PUBLIC_RECURSOSHUMANOS}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: process?.env?.NEXT_PUBLIC_RECURSOSHUMANOS
};


/**
 * api para consumir el sistema de tramite
 */
export const tramite = {
    get: async (path, config = { }, ctx, realPath = false) => {
        return axios.get(realPath ? path : `${process?.env?.NEXT_PUBLIC_TRAMITE}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx, realPath = false) => {
        return axios.post(realPath ? path : `${process?.env?.NEXT_PUBLIC_TRAMITE}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx, realPath = false) => {
        return fetch(realPath ? path : `${process?.env?.NEXT_PUBLIC_TRAMITE}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: process?.env?.NEXT_PUBLIC_TRAMITE
};


/**
 * api para consumir el sistema de signature
 */
export const signature = {
    get: async (path, config = { }, ctx) => {
        return axios.get(`${process?.env?.NEXT_PUBLIC_SIGNATURE}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${process?.env?.NEXT_PUBLIC_SIGNATURE}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${process?.env?.NEXT_PUBLIC_SIGNATURE}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: process?.env?.NEXT_PUBLIC_SIGNATURE
};


/**
 * api para consumir el sistema de project-tracking
 */
export const projectTracking = {
    get: async (path, config = { }, ctx) => {
        return axios.get(`${process?.env?.NEXT_PUBLIC_PROJECT_TRACKING}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${process?.env?.NEXT_PUBLIC_PROJECT_TRACKING}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${process?.env?.NEXT_PUBLIC_PROJECT_TRACKING}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: process?.env?.NEXT_PUBLIC_PROJECT_TRACKING
};



export default {
    authentication,
    unujobs,
    escalafon,
    recursoshumanos,
    tramite,
    signature,
    projectTracking,
}