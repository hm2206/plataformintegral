import React from 'react';
import { SelectBase } from './utils';
import { clock } from '../../services/apis';


const SelectConfigAssistance = ({ id = "id", year, month, name, value, onChange, error = false, refresh = true, onReady = null }) => {
    return <SelectBase 
        execute={true}
        api={clock}
        url={`config_assistances?year=${year}&month=${month}`}
        id={`select-config_assistances-${name}`}
        value={id}
        text="date"
        obj="config_assistances"
        name={name}
        valueChange={`${value || ""}`}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Configuración de Asistencia"
        refresh={refresh}
        onReady={onReady}
        error={error}
    />
}


export { 
    SelectConfigAssistance
};