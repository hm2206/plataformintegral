import React from 'react';
import { SelectBase } from './utils';
import { authentication } from '../../services/apis';
import { Select } from 'semantic-ui-react';

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

const SelectEntityUser = ({ id = "id", user_id, name, value, onChange, refresh }) => {
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
    />
}


const SelectEntityDependenciaUser = ({ id = "id", user_id, entity_id, name, value, onChange, refresh }) => {
    return <SelectBase 
        execute={user_id}
        api={authentication}
        url={`user/${user_id}/dependencia/${entity_id}`}
        id={`select-user-dependencia-${name}`}
        value={id}
        text="name"
        obj="entities"
        name={name}
        valueChange={value || ""}
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


const SelectDependencia = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
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
            />
}


const SelectDependenciaPerfilLaboral = ({ dependencia_id, id = "id", name, value, onChange, refresh = false, disabled = false, execute = true }) => {
    return dependencia_id 
        ?   <SelectBase 
                api={authentication}
                url={`dependencia/${dependencia_id}/perfil_laboral`}
                id={`select-dependencia-perfil-laboral-${id}-${name}`}
                value={id}
                text="nombre"
                obj="perfil_laboral"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Perfil Laboral"
                refresh={refresh}
                execute={execute}
                disabled={disabled}
            />
        :   <Select placeholder="Seleccionar Perfil Laboral" disabled fluid value="" options={[]}/>
}


const SelectPerfilLaboral = ({ id = "id", name, value, onChange, refresh = false }) => {
    return <SelectBase 
                api={authentication}
                url={`perfil_laboral`}
                id={`select_perfil_laboral-${id}-${name}`}
                value={id}
                text="nombre"
                obj="perfil_laboral"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Perfil Laboral"
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


export { 
    SelectDependencia,
    SelectDependenciaPerfilLaboral,
    SelectPerfilLaboral,
    SelectEntityNotUser,
    SelectEntityUser,
    SelectEntityDependenciaUser,
    SelectEntityDependenciaNotUser,
    SelectInstitution,
};