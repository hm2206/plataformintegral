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

const SelectConfigDependenciaDestino = ({ id = "id", name, dependencia_id, value, onChange, error = false, onReady = null }) => {
    return <SelectBase 
        execute={false}
        api={tramite}
        headers={{ dependenciaId: dependencia_id }}
        url={`config_dependencias/${dependencia_id}/dependencia_destino`}
        id={`select-config_dependencia_destino-${name}`}
        value={id}
        text="nombre"
        obj="dependencia_destinos"
        name={name}
        valueChange={`${value || ""}`}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Dependencia"
        refresh={dependencia_id}
        error={error}
        onReady={onReady}
    />
}


export { 
    SelectTramiteType,
    SelectConfigDependenciaDestino
};