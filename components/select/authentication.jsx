import React from 'react';
import { SelectBase } from './utils';
import { authentication } from '../../services/apis';
import { Select } from 'semantic-ui-react';

const SelectDocumentType = ({ id = "id", name, value, onChange, refresh, disabled = false }) => {
    return <SelectBase 
        execute={true}
        api={authentication}
        url={`document_type`}
        id={`select-documen_type-${name}`}
        value={id}
        text="name"
        obj="document_type"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar tip. Documento"
        refresh={refresh}
        disabled={disabled}
    />
}

const SelectDepartamento = ({ id = "id", name, value, onChange, refresh, disabled = false }) => {
    return <SelectBase 
        execute={true}
        api={authentication}
        url={`departamento`}
        id={`select-departamento-${name}`}
        value={id}
        text="departamento"
        obj="departamento"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Departamento"
        refresh={refresh}
        disabled={disabled}
    />
}

const SelectProvincia = ({ id = "id", departamento_id,  name, value, onChange, refresh, disabled = false }) => {
    return <SelectBase 
        execute={false}
        api={authentication}
        url={`departamento/${departamento_id}/provincia`}
        id={`select-departamento-provincia-${name}`}
        value={id}
        text="provincia"
        obj="provincia"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Provincia"
        refresh={refresh}
        disabled={disabled}
    />
}

const SelectDistrito = ({ id = "id", departamento_id, provincia_id,  name, value, onChange, refresh, disabled = false }) => {
    return <SelectBase 
        execute={false}
        api={authentication}
        url={`departamento/${departamento_id}/provincia/${provincia_id}/distrito`}
        id={`select-departamento-provincia-distrito-${name}`}
        value={id}
        text="distrito"
        obj="distrito"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Distrito"
        refresh={refresh}
        disabled={disabled}
    />
}

const SelectSystem = ({ id = "id", name, value, onChange, refresh }) => {
    return <SelectBase 
        execute={true}
        api={authentication}
        url={`system`}
        id={`select-system-${name}`}
        value={id}
        text="name"
        obj="systems"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Sistema"
        refresh={refresh}
    />
}

const SelectSystemModule = ({ system_id, id = "id", name, value, onChange, refresh, disabled = false }) => {
    return <SelectBase 
        execute={false}
        api={authentication}
        url={`system/${system_id}/module`}
        id={`select-system-module-${name}`}
        value={id}
        text="name"
        obj="modules"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Sistema"
        refresh={refresh}
        disabled={disabled}
    />
}


const SelectEntity = ({ id = "id", name, value, onChange, refresh }) => {
    return <SelectBase 
        execute={true}
        api={authentication}
        url={`entity`}
        id={`select-entity-${name}`}
        value={id}
        text="name"
        obj="entities"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Entidad"
        refresh={refresh}
    />
}


const SelectEntityNotUser = ({ id = "id", user_id, name, value, onChange, refresh }) => {
    return <SelectBase 
        execute={user_id}
        api={authentication}
        url={`user/${user_id}/not_entity`}
        id={`select-not-user-${name}`}
        value={id}
        text="name"
        obj="entities"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Entidad"
        refresh={refresh}
    />
}

const SelectEntityUser = ({ id = "id", user_id, name, value, onChange, refresh, onReady = null, disabled = false }) => {
    return <SelectBase 
        execute={user_id}
        api={authentication}
        url={`user/${user_id}/entity`}
        id={`select-user-${name}`}
        value={id}
        text="name"
        obj="entities"
        name={name}
        valueChange={value || ""}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Entidad"
        refresh={refresh}
        onReady={onReady}
        disabled={disabled}
    />
}

const SelectEntityDependenciaUser = ({ id = "id", user_id, entity_id, name, value, onChange, refresh = false, execute = true, disabled = false, except = "" }) => {
    return <SelectBase 
        execute={execute}
        api={authentication}
        url={`user/${user_id}/entity/${entity_id}/dependencia?except=${except}`}
        id={`select-user-dependencia-${name}`}
        value={id}
        text="nombre"
        obj="dependencia"
        name={name}
        valueChange={value || ""}
        disabled={disabled}
        onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
        placeholder="Seleccionar Dependencia"
        refresh={refresh}
    />
}


const SelectEntityDependenciaNotUser = ({ id = "id", user_id, entity_id, name, value, onChange, refresh = false }) => {
    return entity_id 
        ?   <SelectBase 
                execute={user_id}
                api={authentication}
                url={`user/${user_id}/not_dependencia/${entity_id}`}
                id={`select-user-dependencia-not-${name}`}
                value={id}
                text="nombre"
                obj="dependencia"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Dependencia"
                refresh={refresh}
            />
        :   <Select placeholder="Seleccionar Dependencia" disabled fluid value="" options={[]}/>
}


const SelectDependencia = ({ id = "id", name, value, onChange, refresh = false, disabled = false, onReady = null }) => {
    return <SelectBase 
                api={authentication}
                url={`dependencia`}
                id={`select-dependencia-${id}-${name}`}
                value={id}
                text="nombre"
                obj="dependencia"
                name={name}
                valueChange={`${value}`|| ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Dependencia"
                refresh={refresh}
                execute={true}
                disabled={disabled}
                onReady={onReady}
            />
}


const SelectDependenciaPerfilLaboral = ({ dependencia_id, id = "id", name, value, onChange, refresh = false, disabled = false, execute = true }) => {
    return dependencia_id 
        ?   <SelectBase 
                api={authentication}
                url={`dependencia/${dependencia_id}/perfil_laboral`}
                id={`select-dependencia--laboral-${id}-${name}`}
                value={id}
                text="nombre"
                obj="perfil_laboral"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar  Laboral"
                refresh={refresh}
                execute={execute}
                disabled={disabled}
            />
        :   <Select placeholder="Seleccionar  Laboral" disabled fluid value="" options={[]}/>
}


const SelectLaboral = ({ id = "id", name, value, onChange, refresh = false }) => {
    return <SelectBase 
                api={authentication}
                url={`_laboral`}
                id={`select__laboral-${id}-${name}`}
                value={id}
                text="nombre"
                obj="_laboral"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar  Laboral"
                refresh={refresh}
                execute={true}
            />
}


const SelectInstitution = ({ id = "id", name, value, onChange, refresh = false }) => {
    return <SelectBase 
                api={authentication}
                url={`institution`}
                id={`institution-${id}-${name}`}
                value={id}
                text="name"
                obj="institution"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Institución"
                refresh={refresh}
                execute={true}
            />
}

const SelectAuthEntityDependencia = ({ entity_id, id = "id", name, value, onChange, onReady, disabled, onData }) => {
    return <SelectBase 
                api={authentication}
                url={`auth/dependencia/${entity_id}`}
                id={`select_auth_entity_dependencia-${id}-${name}`}
                value={id}
                text="nombre"
                obj="dependencia"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Dependencia"
                refresh={entity_id}
                execute={false}
                onReady={onReady}
                disabled={disabled}
                onData={onData}
            />
}

export { 
    SelectDocumentType,
    SelectDepartamento,
    SelectProvincia,
    SelectDistrito,
    SelectSystem,
    SelectSystemModule,
    SelectDependencia,
    SelectDependenciaPerfilLaboral,
    SelectLaboral,
    SelectEntity,
    SelectEntityNotUser,
    SelectEntityUser,
    SelectEntityDependenciaUser,
    SelectEntityDependenciaNotUser,
    SelectInstitution,
    SelectAuthEntityDependencia,
};