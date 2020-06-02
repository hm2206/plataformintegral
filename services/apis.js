import axios from 'axios';
import { url } from '../env.json';
import Cookies from 'js-cookie';
import NextCookies from 'next-cookies';


let headers = {
    Authorization: `Bearer ${Cookies.get('auth_token')}`
};

export const configAuthorization = (ctx) => {
    return `Bearer ${NextCookies(ctx)['auth_token']}`;
}

const ConfigHeaders = async (ctx = null, config = { }) => {
    let newConfig = await Object.assign({}, config);
    newConfig.headers = config.headers || {};
    // validar ctx
    if (ctx) {
        newConfig.headers.Authorization = await configAuthorization(ctx);
    } else {
        newConfig.headers.Authorization = await headers.Authorization
    };
    return newConfig;
}   


/**
 *  api para consumir el authenticador
 */
export const authentication = {
    get: async (path, config = {}, ctx = null) => {
        return axios.get(`${url.API_AUTHENTICATION}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = {}, config = {}, ctx = null) => {
        return axios.post(`${url.API_AUTHENTICATION}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    path: url.API_AUTHENTICATION
};


/**
 * api para consumir el sistema de planillas
 */
export const unujobs = {
    get: async (path, config = { headers }, ctx) => {
        return axios.get(`${url.API_UNUJOBS}/${path}`, await ConfigHeaders(ctx, config));
    },
    post: async (path, body = {}, config = { headers }, ctx) => {
        return axios.post(`${url.API_UNUJOBS}/${path}`, body, await ConfigHeaders(ctx, config));
    },
    fetch: async (path, config = {}, ctx) => {
        return fetch(`${url.API_UNUJOBS}/${path}`, await ConfigHeaders(ctx, config));
    },
    path: url.API_UNUJOBS
};


