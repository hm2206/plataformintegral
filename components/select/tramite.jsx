import React from 'react';
import { SelectBase } from './utils';
import { tramite } from '../../services/apis';


const SelectTramiteType = ({ id = "id", name, value, onChange, refresh, error = false }) => {
    return <SelectBase 
        execute={true}
        api={tramite}
        url={`tramite_type`}
        id={`select-tramite_type-${name}`}
        value={id}
        text="description"
        obj="tramite_type"
        name={name}
        valueChange={`${value || ""}`}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Tip. Documento"
        refresh={refresh}
        error={error}
    />
}


export { 
    SelectTramiteType
};