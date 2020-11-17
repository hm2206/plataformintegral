import React from 'react';
import { SelectBase } from './utils';
import { unujobs } from '../../services/apis';

const SelectPlanilla = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`planilla`}
                id={`select-planilla-${id}-${name}`}
                value={id}
                text="nombre"
                obj="planillas"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Planilla"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectCronogramaCargo = ({ text = 'alias', id = "id", cronograma_id, name, value, onChange, execute = true, refresh = false, disabled = false, defaultDatos = [] }) => {
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
                execute={execute}
                disabled={disabled}
            />
}

const SelectCronogramaTypeCategoria = ({ id = "id", cronograma_id, name, value, onChange, execute = true, refresh = false, disabled = false }) => {
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
                execute={execute}
                disabled={disabled}
            />
}

const SelectTypeDescuento = ({ id = "id", name, value, onChange, refresh = false, disabled = false, judicial = "" }) => {
    return <SelectBase 
                api={unujobs}
                url={`type_descuento?judicial=${judicial}`}
                id={`select-type_detalle-${id}-${name}`}
                value={id}
                text="informacion"
                obj="type_descuentos"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Tip. Descuento"
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

const SelectCronogramaAfp = ({ id = "afp_id", cronograma_id, name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`cronograma/${cronograma_id}/afp`}
                id={`select-cronograma-afp-${id}-${name}`}
                value={id}
                text="afp"
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
                execute={refresh || cronograma_id}
                disabled={disabled}
            />
}

const SelectMeta = ({ id = "id", name, text = "descripcion", value, onChange, year = "", refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`meta?year=${year}`}
                id={`select-meta-${id}-${name}`}
                value={id}
                text={text}
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

const SelectCargo = ({ id = "id", text = "descripcion", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`cargo`}
                id={`select-cargo-${id}-${name}`}
                value={id}
                text={text}
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

const SelectTypeCategoriaCargo = ({ id = "id", type_categoria_id, text = "descripcion", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`type_categoria/${type_categoria_id}/cargo`}
                id={`select-type_categoria_cargo-${id}-${name}`}
                value={id}
                text={text}
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

const SelectCargoTypeCategoria = ({ id = "id", execute = true, name, value, cargo_id, onChange, refresh = false, disabled = false }) => {
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
                execute={execute}
                disabled={disabled}
            />
} 

const SelectBanco = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`banco`}
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

const SelectCronogramaTypeRemuneracion = ({ text = 'descripcion', id = "id", cronograma_id, name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`cronograma/${cronograma_id}/type_remuneracion`}
                id={`select-cronograma-type_remuneracions-${id}-${name}`}
                value={id}
                text={text}
                obj="type_remuneracions"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Tip. Remuneración"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectCronogramaTypeDescuento = ({ text = 'alias', id = "id", cronograma_id, name, value, onChange, refresh = false, disabled = false, query = "" }) => {
    return <SelectBase 
                api={unujobs}
                url={`cronograma/${cronograma_id}/type_descuento${query}`}
                id={`select-cronograma-type_descuentos-${id}-${name}`}
                value={id}
                text={text}
                obj="type_descuentos"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Tip. Descuentos"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectCronogramaTypeDetalle = ({ text = 'descripcion', id = "id", cronograma_id, name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`cronograma/${cronograma_id}/type_detalle`}
                id={`select-cronograma-type_detalle-${id}-${name}`}
                value={id}
                text={text}
                obj="type_detalles"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Descuentos Detallados"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectCronogramaTypeAportacion = ({ text = 'alias', id = "id", cronograma_id, name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={unujobs}
                url={`cronograma/${cronograma_id}/type_aportacion`}
                id={`select-cronograma-type_aportacion-${id}-${name}`}
                value={id}
                text={text}
                obj="type_aportacions"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Tip. Aportación"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectTypeCategoriaNotTypeRemuneracion = ({ id = "id", type_categoria_id, planilla_id, name, value, onChange, refresh = false, disabled = false, execute = true }) => {
    return <SelectBase 
                api={unujobs}
                url={`type_categoria/${type_categoria_id}/not_type_remuneracion?planilla_id=${planilla_id}`}
                id={`select-type_categoria-not_type_remuneracion-${id}-${name}`}
                value={id}
                text="informacion"
                obj="type_remuneracions"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Tip. Remuneración"
                refresh={refresh}
                execute={execute}
                disabled={disabled}
            />
}

// exportables
export { 
    SelectPlanilla,
    SelectCronogramaCargo,
    SelectCronogramaTypeCategoria,
    SelectTypeDetalle,
    SelectTypeSindicato,
    SelectTypeAportacion,
    SelectAfp,
    SelectCronogramaMeta,
    SelectMeta,
    SelectTypeCategoriaCargo,
    SelectSitacionLaboral,
    SelectCargo,
    SelectCargoTypeCategoria,
    SelectTypeDescuento,
    SelectBanco,
    SelectCronogramaAfp,
    SelectCronogramaTypeRemuneracion,
    SelectCronogramaTypeDescuento,
    SelectCronogramaTypeDetalle,
    SelectCronogramaTypeAportacion,
    SelectTypeCategoriaNotTypeRemuneracion,
};