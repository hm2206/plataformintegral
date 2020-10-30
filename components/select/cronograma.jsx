import React from 'react';
import { SelectBase } from './utils';
import { unujobs } from '../../services/apis';

const SelectCronogramaCargo = ({ id = "id", cronograma_id, name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`cronograma/${cronograma_id}/cargo`}
                id={`select-cronograma-cargo-${id}-${name}`}
                value={id}
                text="alias"
                obj="cargos"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Cargo"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}


const SelectCronogramaTypeCategoria = ({ id = "id", cronograma_id, name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`cronograma/${cronograma_id}/type_categoria`}
                id={`select-cronograma-type_categoria-${id}-${name}`}
                value={id}
                text="descripcion"
                obj="type_categoria"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Tip. Categoría"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}


const SelectTypeDetalle = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`type_detalle`}
                id={`select-type_detalle-${id}-${name}`}
                value={id}
                text="descripcion"
                obj="type_detalles"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Desc. Detallado"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectTypeSindicato = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`type_sindicato`}
                id={`select-type_sindicato-${id}-${name}`}
                value={id}
                text="nombre"
                obj="type_sindicatos"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Afiliación"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectTypeAportacion = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`type_aportacion`}
                id={`select-type_aportacion-${id}-${name}`}
                value={id}
                text="descripcion"
                obj="type_aportaciones"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Aportacion Emp."
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

export { 
    SelectCronogramaCargo,
    SelectCronogramaTypeCategoria,
    SelectTypeDetalle,
    SelectTypeSindicato,
    SelectTypeAportacion,
};