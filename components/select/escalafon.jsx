import React from 'react';
import { SelectBase } from './utils';
import { escalafon } from '../../services/apis';


const SelectAfp = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={escalafon}
        url={`afps`}
        id={`select-afp-${id}-${name}`}
        value={id}
        text="description"
        obj="afps"
        name={name}
        valueChange={`${value || ""}`}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Ley Social"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectBanco = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={escalafon}
        url={`bancos`}
        id={`select-banco-${id}-${name}`}
        value={id}
        text="nombre"
        obj="bancos"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Banco"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectConfigAssistance = ({ id = "id", year, month, name, value, onChange, error = false, refresh = true, onReady = null }) => {
    return <SelectBase 
        execute={true}
        api={escalafon}
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

const SelectConfigSchedule = ({ id = "id", name, value, onChange, error = false, refresh = true, onReady = null, disabled = false }) => {
    return <SelectBase 
        execute={true}
        api={escalafon}
        url={`config_schedules`}
        id={`select-config_schedules-${name}`}
        value={id}
        text="name"
        obj="config_schedules"
        name={name}
        valueChange={`${value || ""}`}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Config. de Horario"
        refresh={refresh}
        onReady={onReady}
        error={error}
        disabled={disabled}
    />
}


export { 
    SelectAfp,
    SelectBanco,
    SelectConfigAssistance,
    SelectConfigSchedule,
};