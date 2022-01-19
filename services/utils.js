import Cookies from 'js-cookie';

export const parseOptions = (
    data = [], 
    selected = ['', '', 'Select.'],
    index = [],  
    replace = ['key', 'value', 'text'] 
) => {
    let newData = [];
    try {
        if (selected) {
            let payload = {};
            for(let rep in replace) {
                payload[replace[rep]] = selected[rep];
            }
            // add first
            newData.push(payload);
        }
        data.filter(d => {
            let metaData = {};
            for(let i in index) {
                let key = replace[i];
                let value = d[index[i]];
                metaData[key] = key == 'key' ? `${selected[0]}-${value}` : value;
            }
            // add
            newData.push(metaData);
        });
        // response
        return newData;
    } catch (error) {
        return [];
    }
}

export const parseUrl = (path = "", replace) => {
    let newPath = path.split('/');
    newPath.splice(-1, 1);
    newPath.push(replace);
    return newPath.join("/");
}

export const backUrl = (path = "") => {
    let newPath = path.split('/');
    newPath.splice(-1, 1);
    return newPath.join("/");
}

export const Confirm = async (icon = null, text = null, btn = null) => {
    const Swal = require('sweetalert2');
    icon = icon ? icon : 'warning';
    text = text ? text : "¿Deseas guardar los cambios?";
    btn = btn ? btn : "Continuar";
    let { value } = await Swal.fire({ 
        icon: icon,
        text: text,
        confirmButtonText: btn,
        showCancelButton: true
    });
    // response
    return value;
}

export const urlStringQuery = (path = "", query = {}) => {
    let newString = path.split("?");
    let newPath = newString[0];
    let index = 0;
    // crendenciales
    newPath += `?ClientId=${process?.env?.NEXT_PUBLIC_CLIENT_ID}`;
    newPath += `&ClientSecret=${process?.env?.NEXT_PUBLIC_CLIENT_SECRET}`
    // add query
    for (let q in query) {
        newPath += `&${q}=${query[q]}`;
    }
    // add queryString
    newPath += `&${newPath[1] || ""}`;
    // response pathname
    return newPath.toLocaleLowerCase();
}

export const InputCredencias = () => {
    let inputs = [];

    const credentials = {
        ClientId: process?.env?.NEXT_PUBLIC_CLIENT_ID,
        ClientSecret: process?.env?.NEXT_PUBLIC_CLIENT_SECRET
    }

    for(let cre in credentials) {
        let input = document.createElement('input');
        input.name = cre;
        input.value = credentials[cre];
        input.hidden = true;
        inputs.push(input);
    }
    // response
    return inputs;
}

export const InputAuth = () => {
    let input = document.createElement('input');
    input.name = 'auth_token';
    input.value = Cookies.get('auth_token');
    input.hidden = true;
    return input;
}

export const InputEntity = () => {
    let input = document.createElement('input');
    input.name = 'EntityId';
    input.value = Cookies.get('EntityId');
    input.hidden = true;
    return input;
}

export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}