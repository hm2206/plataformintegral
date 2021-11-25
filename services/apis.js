import axios from 'axios';
import { url, credencials } from '../env.json';
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
    for(let attr in credencials) {
        newConfig.headers[attr] = credencials[attr];
    }
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
        return axios.get(`${url.API_AUTHENTICATION}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx = null) => {
        return axios.post(`${url.API_AUTHENTICATION}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    path: url.API_AUTHENTICATION
};


/**
 * api para consumir el sistema de planillas
 */
export const unujobs = {
    get: async (path, config = { }, ctx) => {
        return axios.get(`${url.API_UNUJOBS}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${url.API_UNUJOBS}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${url.API_UNUJOBS}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: url.API_UNUJOBS
};


/**
 * api para consumir el sistema de micro-planilla
 */
 export const microPlanilla = {
    get: async (path, config = { }, ctx) => {
        return axios.get(`${url.MICRO_PLANILLA}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${url.MICRO_PLANILLA}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${url.MICRO_PLANILLA}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: url.MICRO_PLANILLA
};


/**
 * api para consumir el sistema de escalafón
 */
export const escalafon = {
    get: async (path, config = { }, ctx) => {
        return axios.get(`${url.API_ESCALAFON}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${url.API_ESCALAFON}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${url.API_ESCALAFON}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: url.API_ESCALAFON
};

/**
 * api para consumir el sistema de Recursos humanos
 */
export const recursoshumanos = {
    get: async (path, config = { }, ctx) => {
        return axios.get(`${url.API_RECURSOSHUMANOS}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${url.API_RECURSOSHUMANOS}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${url.API_RECURSOSHUMANOS}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: url.API_RECURSOSHUMANOS
};


/**
 * api para consumir el sistema de tramite
 */
export const tramite = {
    get: async (path, config = { }, ctx, realPath = false) => {
        return axios.get(realPath ? path : `${url.API_TRAMITE}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx, realPath = false) => {
        return axios.post(realPath ? path : `${url.API_TRAMITE}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx, realPath = false) => {
        return fetch(realPath ? path : `${url.API_TRAMITE}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: url.API_TRAMITE
};


/**
 * api para consumir el sistema de signature
 */
export const signature = {
    get: async (path, config = { }, ctx) => {
        return axios.get(`${url.API_SIGNATURE}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${url.API_SIGNATURE}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${url.API_SIGNATURE}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: url.API_SIGNATURE
};


/**
 * api para consumir el sistema de project-tracking
 */
export const projectTracking = {
    get: async (path, config = { }, ctx) => {
        return axios.get(`${url.API_PROJECT_TRACKING}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${url.API_PROJECT_TRACKING}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${url.API_PROJECT_TRACKING}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: url.API_PROJECT_TRACKING
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