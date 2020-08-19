import axios from 'axios';
import { url, credencials } from '../env.json';
import Cookies from 'js-cookie';
import NextCookies from 'next-cookies';


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
    return newConfig;
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
    get: async (path, config = { }, ctx) => {
        return axios.get(`${url.API_TRAMITE}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = { }, config = { }, ctx) => {
        return axios.post(`${url.API_TRAMITE}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = { }, ctx) => {
        return fetch(`${url.API_TRAMITE}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: url.API_TRAMITE
};

