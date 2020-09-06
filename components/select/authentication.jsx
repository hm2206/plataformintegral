import React from 'react';
import { SelectBase } from './utils';
import { authentication } from '../../services/apis';

const SelectEntityNotUser = ({ user_id, name, value, onChange, refresh }) => {
    try {
        return <SelectBase 
            execute={user_id}
            api={authentication}
            url={`user/${user_id}/not_entity`}
            id={`select-not-user-${name}`}
            value="id"
            text="name"
            obj="entities"
            name={name}
            valueChange={value || ""}
            onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
            placeholder="Seleccionar Entidad"
            refresh={refresh}
        />;
    } catch (error) {
        return 'ok';
    }
}

const SelectEntityUser = ({ user_id, name, value, onChange }) => {
    try {
        return <SelectBase 
            execute={user_id}
            api={authentication}
            url={`user/${user_id}/entity`}
            id={`select-user-${name}`}
            value="id"
            text="name"
            obj="entities"
            name={name}
            valueChange={value || ""}
            onChange={(e, obj) => typeof onChange == 'function' ? onChange(e, obj) : null}
            placeholder="Seleccionar Entidad"
        />;
    } catch (error) {
        return 'ok';
    }
}


export { 
    SelectEntityNotUser,
    SelectEntityUser
};