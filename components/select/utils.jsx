import React, { useState, useEffect } from 'react';
import { Select, Dropdown } from 'semantic-ui-react';
import uid from 'uid';
import Skeleton from 'react-loading-skeleton';

/**
 * setting format for select
 * @param {*} param0 
 */
const settingSelect = async ({ is_new = true, data = [], index = { key: "", value: "", text: "" }, placeholder = "Seleccionar" }) => {
    let newData = [];
    if (is_new) {
        newData.push({
            key: `default-${uid(12)}`,
            value: "",
            text: placeholder
        });
    }
    // return string of object
    const getObj = (obj = {}, value) => {
        let data_string = `${value}`.split('.');
        let response = null;
        // obtener obj
        for (let attr of data_string) {
            try {
                response = obj[attr];
            } catch (error) {
                return value;
            }
        }
        // response 
        return response;
    } 
    // add datos
    await data.filter(async (d, indexD) => {
        await newData.push({
            key: `${index.key}_${indexD + 1}_${uid(10)}`,
            value: `${getObj(d, index.value)}`,
            text: `${getObj(d, index.text)}`.toUpperCase(),
            obj: d
        });
    });
    // response data
    return newData;
}


const ButtonRefresh = ({ message, onClick = null }) => {
    return <a href="#" className="pt-4"
        onClick={(e) => typeof onClick == 'function' ? onClick(e) : null}
    >
        <i className="fas fa-sync"></i> {message}
    </a>
}


const SelectBase = ({ onReady, defaultDatos = [], execute, refresh, url, api, obj, id, value, text, name, onChange, valueChange, placeholder = 'Seleccionar', disabled = false }) => {

    const [datos, setDatos] = useState([])
    const [is_error, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nextPage, setNexPage] = useState(1);
    const [is_ready, setIsReady] = useState(false);
    const [current_execute, setCurrentExecute] = useState(execute);

    const getDatos = async (page = 1) => {
        setLoading(true);
        let query = `${url}`.split('?');
        let newParams = query[1] ? `&${query[1]}` : "";
        let newUrl = query[0] || "";
        await api.get(`${newUrl}?page=${page}${newParams}`)
            .then(async res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                let current_last_page = 0;
                let { lastPage, last_page, data } = res.data[obj];
                current_last_page = typeof lastPage != 'undefined' ? lastPage : last_page;
                // add entities
                let tmpDatos = await settingSelect({ is_new: page == 1 ? true : false, data, index: { key: id, value, text } });
                let newDatos = page == 1 ? tmpDatos : [...datos, ...tmpDatos];
                setDatos(newDatos);
                setIsError(false);
                setLoading(false);
                 // continuar
                if (current_last_page >= page + 1) setNexPage(page + 1);
                else {
                    setIsReady(true);
                    setCurrentExecute(false);
                }
            }).catch(err => {
                setIsError(true);
                setLoading(false);
            });
        // quitar loading
        setLoading(false);
    }

    const feching = async () => {
        await getDatos();
    }

    // obtener entities
    useEffect(() => {
        // execute
        if (execute) feching();
    }, [execute]);

    // refrescar datos
    useEffect(() => {
        if (!current_execute && refresh) feching();
    }, [refresh]);

    // traer la siguiente pagina
    useEffect(() => {
        if (nextPage > 1) getDatos(nextPage, true);
    }, [nextPage]);

    // todos los datos están cargados
    useEffect(() => {
        if (is_ready) if (typeof onReady == 'function') {
            onReady(datos);
            setIsReady(false);
        }
    }, [is_ready]);

    // render
    return is_error 
        ?   <div>
                <ButtonRefresh 
                    onClick={async (e) => await getDatos()}
                    message="Volver a obtener los datos"
                /> 
            </div>
        :   loading 
            ?   <Skeleton height="37px"/>
            :   <Select fluid
                    wrapSelection={false}
                    search
                    disabled={loading || disabled}
                    placeholder={loading ? 'Cargando...' : placeholder}
                    options={defaultDatos.length ? defaultDatos : datos}
                    name={name}
                    onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                    value={`${valueChange || ""}`}
                />
}


export { SelectBase };