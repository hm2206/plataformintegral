import React from 'react';
import { SelectBase } from './utils';
import { projectTracking } from '../../services/apis';

const SelectProject = ({ id = "id", name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={projectTracking}
                url={`project?state=1`}
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

const SelectPlanTrabajoObjective = ({ id = "id", plan_trabajo_id, name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={projectTracking}
                url={`plan_trabajo/${plan_trabajo_id}/objective`}
                id={`select-plan_trabajo-objective-${id}-${name}`}
                value={id}
                text="title"
                obj="objectives"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Componente"
                refresh={refresh}
                execute={false}
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

const SelectPresupuesto = ({ id = "id", principal = 0, year, name, value, onChange, refresh = false, disabled = false }) => {
    return <SelectBase 
                api={projectTracking}
                url={`presupuesto?principal=${principal}&year=${year}`}
                id={`select-presupuesto-${id}-${name}`}
                value={id}
                text="description"
                obj="presupuestos"
                name={name}
                valueChange={value || ""}
                onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
                placeholder="Seleccionar Presupuesto"
                refresh={refresh}
                execute={false}
                disabled={disabled}
            />
}

// exportables
export { 
    SelectProject,
    SelectProjectPlanTrabajo,
    SelectPlanTrabajoObjective,
    SelectRol,
    SelectPresupuesto,
};