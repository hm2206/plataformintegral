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

/**
 *  api para consumir el authenticador
 */
export const authentication = {
    get: (path, config = { headers }) => {
        return axios.get(`${url.API_AUTHENTICATION}/${path}`, config);
    },
    post: (path, body = {}, config = { headers }) => {
        return axios.post(`${url.API_AUTHENTICATION}/${path}`, body, config);
    },
    path: url.API_AUTHENTICATION
};


/**
 * api para consumir el sistema de planillas
 */
export const unujobs = {
    get: (path, config = { headers }) => {
        return axios.get(`${url.API_UNUJOBS}/${path}`, config);
    },
    post: (path, body = {}, config = { headers }) => {
        return axios.post(`${url.API_UNUJOBS}/${path}`, body, config);
    },
    fetch: (path, config = { headers }) => {
        return fetch(`${url.API_UNUJOBS}/${path}`, config);
    },
    path: url.API_UNUJOBS
};


