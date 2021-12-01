import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import uid from 'uid';

/**
 * setting format for select
 * @param {*} param0 
 */
const settingSelect = async ({ is_new = true, data = [], index = { key: "", value: "", text: "" }, displayText = null, placeholder = "Seleccionar" }) => {
    let newData = [];
    if (is_new) {
        newData.push({
            key: `default-${uid(12)}`,
            value: "",
            label: placeholder
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
        let text = `${getObj(d, index.text)}`.toUpperCase()
        if (typeof displayText == 'function') text = await displayText(d);
        // agregar data
        await newData.push({
            key: `${index.key}_${indexD + 1}_${uid(10)}`,
            value: `${getObj(d, index.value)}`,
            label: text,
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

const SelectDefault = ({ 
    onReady, defaultDatos = [], execute, refresh, url, api, 
    obj, id, value = 'id', text, name, onChange, valueInput, onDefaultValue = null,
    displayText = null, onData = null, placeholder = 'Seleccionar', 
    headers = { 'ContentType': 'application/json' }, isMulti = false,
    disabled = false, error = false, defaultValue = null }) => {

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
        await api.get(`${newUrl}?page=${page}${newParams}`, { headers })
            .then(async res => {
                let { success, message } = res.data;
                let is_array = res.data[obj];
                if (Array.isArray(is_array)) {
                    let tmpDatos = res.data[obj];
                    let newDatos = await settingSelect({ is_new: true, data: tmpDatos, index: { key: id, value, text }, displayText });
                    setDatos(newDatos);
                    setIsError(false);
                    setLoading(false);
                    setIsReady(true);
                    setCurrentExecute(false);
                } else {
                    if (!success) throw new Error(message);
                    let current_last_page = 0;
                    let { lastPage, last_page, data } = res.data[obj];
                    current_last_page = typeof lastPage != 'undefined' ? lastPage : last_page;
                    // add entities
                    let tmpDatos = await settingSelect({ is_new: page == 1 ? true : false, data, index: { key: id, value, text }, displayText });
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

    const handleReady = () => {
        setIsReady(false);
        if (typeof onReady == 'function') onReady(datos);
        if (defaultValue < 0) return;
        let obj = datos[defaultValue] || {};
        if (!Object.keys(obj).length) return false;
        if (typeof onDefaultValue == 'function') onDefaultValue(obj);
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
        if (is_ready) handleReady();
    }, [is_ready]);

    // enviar datos pre cargados 
    useEffect(() => {
        if (datos.length) typeof onData == 'function' ? onData(datos) : null;
    }, [datos]);

    // render
    return is_error 
        ?   <div>
                <ButtonRefresh 
                    onClick={async (e) => await getDatos()}
                    message="Volver a obtener los datos"
                /> 
            </div>
        :   (
            <Select fluid
                isMulti={isMulti}
                wrapSelection={false}
                isClearable
                isLoading={loading}
                isDisabled={loading || disabled}
                placeholder={loading ? 'Cargando...' : placeholder}
                options={defaultDatos.length ? defaultDatos : datos}
                name={name}
                onChange={(obj) => typeof onChange == 'function' ? onChange(name, obj) : null}
                compact
                value={valueInput}
                error={error}
            />
        )
}


export { SelectDefault };