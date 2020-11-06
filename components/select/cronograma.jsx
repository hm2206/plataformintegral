import React from 'react';
import { SelectBase } from './utils';
import { unujobs } from '../../services/apis';

const SelectCronogramaCargo = ({ text = 'alias', id = "id", cronograma_id, name, value, onChange, refresh = false, disabled = false, defaultDatos = [] }) => {
    return <SelectBase 
                api={unujobs}
                url={`cronograma/${cronograma_id}/cargo`}
                id={`select-cronograma-cargo-${id}-${name}`}
                value={id}
                text={text}
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

const SelectAfp = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`afp`}
                id={`select-afp-${id}-${name}`}
                value={id}
                text="descripcion"
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

const SelectCronogramaMeta = ({ id = "id", cronograma_id, name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`cronograma/${cronograma_id}/meta`}
                id={`select-cronograma-meta-${id}-${name}`}
                value={id}
                text="metaID"
                obj="metas"
                name={name}
                valueChange={`${value || ""}`}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Meta Pres."
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectMeta = ({ id = "id", name, value, onChange, year = "", refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`meta?year=${year}`}
                id={`select-meta-${id}-${name}`}
                value={id}
                text="descripcion"
                obj="metas"
                name={name}
                valueChange={`${value || ""}`}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Meta Pres."
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectSitacionLaboral = ({ id = "id", name, licencia = 2, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`situacion_laboral?licencia=${licencia}`}
                id={`select-situacion-laboral-${id}-${name}`}
                value={id}
                text="nombre"
                obj="situacion_laboral"
                name={name}
                valueChange={`${value || ""}`}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Situación Lab."
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectCargo = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`cargo`}
                id={`select-cargo-${id}-${name}`}
                value={id}
                text="descripcion"
                obj="cargos"
                name={name}
                valueChange={`${value || ""}`}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Partición Pre"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
} 


const SelectCargoTypeCategoria = ({ id = "id", name, value, cargo_id, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`cargo/${cargo_id}/type_categoria`}
                id={`select-cargo-type_categoria${id}-${name}`}
                value={id}
                text="descripcion"
                obj="type_categorias"
                name={name}
                valueChange={`${value || ""}`}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Tip. Categoría"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
} 

// exportables
export { 
    SelectCronogramaCargo,
    SelectCronogramaTypeCategoria,
    SelectTypeDetalle,
    SelectTypeSindicato,
    SelectTypeAportacion,
    SelectAfp,
    SelectCronogramaMeta,
    SelectMeta,
    SelectSitacionLaboral,
    SelectCargo,
    SelectCargoTypeCategoria,
};