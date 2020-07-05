import { credencials } from '../env.json';

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
    for (let cre in credencials) {
        newPath += index == 0 ? `?${cre}=${credencials[cre]}` : `&${cre}=${credencials[cre]}`;
        index++;
    }
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
    for(let cre in credencials) {
        let input = document.createElement('input');
        input.name = cre;
        input.value = credencials[cre];
        input.hidden = true;
        inputs.push(input);
    }
    // response
    return inputs;
}