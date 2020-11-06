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

// exportables
export { 
    SelectProject,
};