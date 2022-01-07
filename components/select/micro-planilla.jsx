import React from 'react';
import { SelectBase } from './utils';
import { microPlanilla } from '../../services/apis';
import moment from 'moment'


const SelectAfp = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`afps`}
        id={`select-afp-${id}-${name}`}
        value={id}
        displayText={(data) => data.isPrivate ? `${data.name} - ${data.typeAfp}` : data.name}
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

const SelectBank = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`banks`}
        id={`select-banks-${id}-${name}`}
        value={id}
        text="name"
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

const SelectTypeCargo = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`typeCargos`}
        id={`select-type-cargos-${id}-${name}`}
        value={id}
        text="name"
        obj="typeCargos"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Tipo Trabajador"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectTypeCategory = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`typeCategories`}
        id={`select-type-category-${id}-${name}`}
        value={id}
        text="name"
        obj="typeCategories"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Categoría"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectDependency = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`dependencies`}
        id={`select-dependency-${id}-${name}`}
        value={id}
        text="name"
        obj="dependencies"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Dependencia"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectProfile = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`profiles`}
        id={`select-profile-${id}-${name}`}
        value={id}
        text="name"
        obj="profiles"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Perfil"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

const SelectHourhand = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
        api={microPlanilla}
        url={`hourhands`}
        id={`select-hourhand-${id}-${name}`}
        value={id}
        text="name"
        obj="hourhands"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Horario"
        refresh={refresh}
        execute={true}
        disabled={disabled}
    />
}

export { 
    SelectAfp,
    SelectBank,
    SelectTypeCargo,
    SelectTypeCategory,
    SelectDependency,
    SelectProfile,
    SelectHourhand,
};