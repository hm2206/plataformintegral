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
            text: `${getObj(d, index.text)}`.toUpperCase()
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

    const getDatos = async (page = 1) => {
        setLoading(true);
        let newParams = `${url}`.split('?')[1] || "";
        let newUrl = `${url}`.split('?')[0] || "";
        await api.get(`${newUrl}?page=${page}&${newParams}`)
            .then(async res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                let { lastPage, data } = res.data[obj];
                // add entities
                let tmpDatos = await settingSelect({ data, index: { key: id, value, text } });
                setDatos(page == 1 ? tmpDatos : [...datos, ...tmpDatos]);
                setIsError(false);
                // traer la siguiente page
                if (lastPage >= page + 1) await getDatos(page + 1);
                else setLoading(false);
            }).catch(err => {
                setIsError(true);
                setLoading(false);
            });
    }

    // obtener entities
    useEffect(() => {
        // execute
        if (execute)  {
            getDatos();
            console.log('get execute');
        }
    }, [execute]);

    // refrescar datos
    useEffect(() => {
        if (refresh) {
            getDatos(1);
            console.log('get refresh');
        }
    }, [refresh]);

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