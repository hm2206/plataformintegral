import React from 'react';
import { SelectBase } from './utils';
import { projectTracking } from '../../services/apis';


const SelectTypeProject = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={projectTracking}
                url={`type_projects`}
                id={`select-type_project-${id}-${name}`}
                value={id}
                text="name"
                obj="type_project"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar tipo Proyecto"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectProject = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={projectTracking}
                url={`project?state[]=START&state[]=EXECUTE`}
                id={`select-project-${id}-${name}`}
                value={id}
                text="code"
                obj="projects"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Proyecto"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectProjectPlanTrabajo = ({ id = "id", project_id, name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={projectTracking}
                url={`project/${project_id}/plan_trabajo`}
                id={`select-plan_trabajo-${id}-${name}`}
                value={id}
                text="date_start"
                obj="plan_trabajos"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Plan de Trabajo"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectProjectObjective = ({ id = "id", project_id, name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={projectTracking}
                url={`project/${project_id}/objective`}
                id={`select-project-objective-${id}-${name}`}
                value={id}
                text="title"
                obj="objectives"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Objectivo"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectRol = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={projectTracking}
                url={`role?state=1`}
                id={`select-rol-${id}-${name}`}
                value={id}
                text="description"
                obj="roles"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Rol"
                refresh={refresh}
                execute={true}
                disabled={disabled}
            />
}

const SelectPresupuesto = ({ id = "id", principal = 0, name, value, onChange, refresh = false, disabled = false, execute = true, text = "description" }) => {
    return <SelectBase 
                api={projectTracking}
                url={`presupuesto?principal=${principal}`}
                id={`select-presupuesto-${id}-${name}`}
                value={id}
                text={text}
                obj="presupuestos"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Presupuesto"
                refresh={refresh}
                execute={execute}
                disabled={disabled}
            />
}

const SelectMedida = ({ id = "id", name, value, onChange, refresh = false, disabled = false, execute = false }) => {
    return <SelectBase 
                api={projectTracking}
                url={`medida`}
                id={`select-medida-${id}-${name}`}
                value={id}
                text="name_short"
                obj="medidas"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Unidad de Medida"
                refresh={refresh}
                execute={execute}
                disabled={disabled}
            />
}

const SelectDocumentType = ({ id = "id", name, value, onChange, refresh = false, disabled = false, execute = true }) => {
    return <SelectBase 
                api={projectTracking}
                url={`document_type`}
                id={`select-document_type-${id}-${name}`}
                value={id}
                text="informacion"
                obj="document_types"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Tip. Documento"
                refresh={refresh}
                execute={execute}
                disabled={disabled}
            />
}

const SelectMedioPago = ({ id = "id", name, value, onChange, refresh = false, disabled = false, execute = true }) => {
    return <SelectBase 
                api={projectTracking}
                url={`medio_pago`}
                id={`select-medio_pago-${id}-${name}`}
                value={id}
                text="name"
                obj="medio_pagos"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Medio de Pago"
                refresh={refresh}
                execute={execute}
                disabled={disabled}
            />
}

const SelectPlanTrabajoActivity = ({ id = "id", name, value, plan_trabajo_id, onChange, refresh = false, disabled = false, execute = true, except = 0, verify = 0, objective_id = "", principal = false }) => {
    return <SelectBase 
                api={projectTracking}
                url={`plan_trabajo/${plan_trabajo_id}/activity?except=${except}&verify=${verify}&objective_id=${objective_id}&principal=${principal ? 1 : 0}`}
                id={`select-medio_pago-${id}-${name}`}
                value={id}
                text="title"
                obj="actividades"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Actividad"
                refresh={refresh}
                execute={execute}
                disabled={disabled}
            />
}

const SelectRubro = ({ id = "id", name, value, onChange, refresh = false, disabled = false, execute = true }) => {
    return <SelectBase 
                api={projectTracking}
                url={`rubro`}
                id={`select-rubro-${id}-${name}`}
                value={id}
                text="description"
                obj="rubros"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Rubro"
                refresh={refresh}
                execute={execute}
                disabled={disabled}
            />
}

const SelectArea = ({ id = "id", name, value, onChange, refresh = false, disabled = false, execute = true }) => {
    return <SelectBase 
                api={projectTracking}
                url={`area`}
                id={`select-area-${id}-${name}`}
                value={id}
                text="description"
                obj="areas"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Líneas de Investigación"
                refresh={refresh}
                execute={execute}
                disabled={disabled}
            />
}


// exportables
export { 
    SelectTypeProject,
    SelectProject,
    SelectProjectPlanTrabajo,
    SelectProjectObjective,
    SelectRol,
    SelectPresupuesto,
    SelectMedida,
    SelectDocumentType,
    SelectMedioPago,
    SelectPlanTrabajoActivity,
    SelectRubro,
    SelectArea,
};