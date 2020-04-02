import axios from 'axios';
import { API_AUTHENTICATION, API_UNUJOBS } from '../env.json';
import Cookies from 'js-cookie';


let headers = {
    Authorization: `Bearer ${Cookies.get('auth_token')}`
};



/**
 *  api para consumir el authenticador
 */
export const authentication = {
    get: (path, config = { headers }) => {
        return axios.get(`${API_AUTHENTICATION}/${path}`, config);
    },
    post: (path, body = {}, config = { headers }) => {
        return axios.post(`${API_AUTHENTICATION}/${path}`, body, config);
    },
    path: API_AUTHENTICATION
};


/**
 * api para consumir el sistema de planillas
 */
export const unujobs = {
    get: (path, config = { headers }) => {
        return axios.get(`${API_UNUJOBS}/${path}`, config);
    },
    post: (path, body = {}, config = { headers }) => {
        return axios.post(`${API_UNUJOBS}/${path}`, body, config);
    },
    fetch: (path, config = { headers }) => {
        return fetch(`${API_UNUJOBS}/${path}`, config);
    },
    path: API_UNUJOBS
};


