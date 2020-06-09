import axios from 'axios';
import { url, credencials } from '../env.json';
import Cookies from 'js-cookie';
import NextCookies from 'next-cookies';


let headers = {
    Authorization: `Bearer ${Cookies.get('auth_token')}`
};

export const configAuthorization = (ctx) => {
    return `Bearer ${NextCookies(ctx)['auth_token']}`;
}

const ConfigHeaders = (ctx = null, config = { }) => {
    let newConfig = Object.assign({}, config);
    newConfig.headers = config.headers || {};
    // add credenciales
    for(let attr in credencials) {
        newConfig.headers[attr] = credencials[attr];
    }
    // validar ctx
    if (ctx) {
        newConfig.headers.Authorization = configAuthorization(ctx);
    } else {
        newConfig.headers.Authorization = headers.Authorization
    };
    return newConfig;
}   


/**
 *  api para consumir el authenticador
 */
export const authentication = {
    get: (path, config = { }, ctx = null) => {
        return axios.get(`${url.API_AUTHENTICATION}/${path}`, ConfigHeaders(ctx, config));
    },
    post: (path, body = { }, config = { }, ctx = null) => {
        return axios.post(`${url.API_AUTHENTICATION}/${path}`, body, ConfigHeaders(ctx, config));
    },
    path: url.API_AUTHENTICATION
};


/**
 * api para consumir el sistema de planillas
 */
export const unujobs = {
    get: (path, config = { }, ctx) => {
        return axios.get(`${url.API_UNUJOBS}/${path}`, ConfigHeaders(ctx, config));
    },
    post: (path, body = { }, config = { }, ctx) => {
        return axios.post(`${url.API_UNUJOBS}/${path}`, body, ConfigHeaders(ctx, config));
    },
    fetch: (path, config = { }, ctx) => {
        return fetch(`${url.API_UNUJOBS}/${path}`, ConfigHeaders(ctx, config));
    },
    path: url.API_UNUJOBS
};


