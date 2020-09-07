import React, { useState, useEffect } from 'react';
import { authentication } from '../../services/apis';
import { Select, Button } from 'semantic-ui-react';

/**
 * setting format for select
 * @param {*} param0 
 */
const settingSelect = async ({ data = [], index = { key: "", value: "", text: "" } }) => {
    let newData = [];
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
    await data.filter((d, indexD) => {
        newData.push({
            key: `${index.key}-${indexD}`,
            value: getObj(d, index.value),
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


const SelectBase = ({ execute, refresh, url, api, obj, id, value, text, name, onChange, valueChange, placeholder = 'Seleccionar' }) => {

    const [datos, setDatos] = useState([])
    const [is_error, setIsError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [nextPage, setNexPage] = useState(1);

    const getDatos = async (page = 1) => {
        setLoading(true);
        let query = `${url}`.split('?');
        let newParams = query[1] ? `&${query[1]}` : "";
        let newUrl = query[0] || "";
        await api.get(`${newUrl}?page=${page}${newParams}`)
            .then(async res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                let { lastPage, data } = res.data[obj];
                // add entities
                let tmpDatos = await settingSelect({ data, index: { key: id, value, text } });
                let newDatos = page == 1 ? tmpDatos : [...datos, ...tmpDatos];
                setDatos(newDatos);
                setIsError(false);
                setLoading(false);
                // continuar
                if (lastPage >= page + 1) setNexPage(page + 1);
            }).catch(err => {
                setIsError(true);
                setLoading(false);
            });
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
        if (refresh) feching();
    }, [refresh]);

    // traer la siguiente pagina
    useEffect(() => {
        if (nextPage > 1) getDatos(nextPage, true);
    }, [nextPage]);

    // render
    return is_error 
        ? <ButtonRefresh 
            onClick={async (e) => await getDatos()}
            message="Volver a obtener los datos"
          /> 
        : <Select fluid
            disabled={loading}
            placeholder={loading ? 'Cargando...' : placeholder}
            options={datos}
            name={name}
            onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
            value={valueChange || ""}
          />
}


export { SelectBase };