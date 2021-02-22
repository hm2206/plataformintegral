import React, { useState } from 'react';
import { Checkbox, Button, Input } from 'semantic-ui-react';
import Show from '../show';
import collect from 'collect.js';


const ItemTable = ({ dependencia, disabled = false, onCheck = null, checked = false, onAction = null }) => {

    // render
    return (
        <tr className={`${disabled ? 'alert-success' : ''} ${checked ? 'alert-success' : ''}`}>
            <td>
                <Show condicion={!disabled}
                    predeterminado={<Checkbox readOnly disabled checked={true}/>}
                >
                    <Checkbox
                        onChange={(e, obj) => typeof onCheck == 'function' ? onCheck(obj.checked, dependencia) : null}
                        checked={checked} 
                    />
                </Show>
            </td>
            <td>{dependencia.nombre || ""}</td>
            <td>
                <Show condicion={!disabled}
                    predeterminado={<Checkbox readOnly disabled checked={true} toggle title="Solo Informativa"/>}
                >
                    <Show condicion={checked}>
                        <Checkbox toggle
                            onChange={(e, obj) => typeof onAction == 'function' ? onAction(obj.checked, dependencia) : null}
                            checked={dependencia.action ? true : false} 
                        >
                        </Checkbox>
                    </Show>
                </Show>
            </td>
        </tr>
    );
}


const templateDependencia = {
    id: "",
    nombre: "",
    type: ""
};


const SelectMultitleDependencia = ({ dependencias = [templateDependencia], disabled = [], onReady = null }) => {

    // checkeds
    const [checked, setChecked] = useState(collect([]));
    const ids = checked.pluck('id').toArray();
    const [current_check, setCurrentCheck] = useState(false);
    const [current_action, setCurrentAction] = useState(false);

    // manejador de checked
    const handleChecked = (action, obj) => {
        let index = ids.indexOf(obj.id);
        let newCheck = collect(JSON.parse(JSON.stringify(checked)));
        // agregar
        if (action && index < 0) newCheck.push(obj);
        // eliminar
        if (!action && index >= 0) newCheck.splice(index, 1);
        // setting
        setChecked(newCheck);
        setCurrentCheck(false);
        setCurrentAction(false);
    }

    // seleccionar todo
    const checkAll = (check = false) => {
        let payload = collect([]);
        if (check) {
            dependencias.filter(dep => {
                let is_disabled = disabled.includes(dep.id);
                if (is_disabled) return false;
                payload.push(dep);
            });
        }
        setChecked(payload);
        setCurrentCheck(check);
        setCurrentAction(checked);
    }

    // seleccionar todas las acciones
    const actionAll = (check = false) => {
        let payload = JSON.parse(JSON.stringify(current_action));
        payload.map(p => {
            p.action = check;
            return p;
        });
        // setting
        console.log(payload);
        setCurrentAction(payload);
    }

    // manejador de acción
    const handleAction = (action, obj) => {
        let index = ids.indexOf(obj.id);
        let newCheck = collect(JSON.parse(JSON.stringify(checked)));
        obj.action = action;
        newCheck.put(index, obj);
        setChecked(newCheck);
    }
    
    // render
    return (
        <div className="card card-body">
            <table className="table">
                <thead>
                    <tr>
                        <th>
                            <Checkbox checked={current_check}
                                onChange={(e, obj) => checkAll(obj.checked)}
                            />
                        </th>
                        <th>
                            <Input fluid
                                name="search"

                            />
                        </th>
                        <th>
                            <Show condicion={current_check}>
                                <Checkbox toggle
                                    onChange={(e, obj) => actionAll(obj.checked)}
                                    value={current_action}
                                />
                            </Show>
                        </th>
                    </tr>
                    <tr>
                        <th>#</th>
                        <th>Dependencia</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    <Show condicion={dependencias.length}>
                        {dependencias.map((dep, indexD) => 
                            <ItemTable
                                key={`list-table-tr-${indexD}`}
                                dependencia={dep}
                                disabled={disabled.includes(dep.id) ? true : false}
                                checked={ids.includes(dep.id) ? true : false}
                                onCheck={handleChecked}
                                onAction={handleAction}
                            />
                        )}
                        {/* estoy seguro */}
                        <tr>
                            <Show condicion={ids.length}>
                                <td colSpan="3" className="text-right">
                                    <Button basic
                                        color="teal"
                                        onClick={(e) => typeof onReady == 'function' ? onReady(checked.toArray()) : null}
                                    >
                                        <i className="fas fa-check"></i> Listo
                                    </Button>
                                </td>
                            </Show>
                        </tr>
                    </Show>
                    <Show condicion={!dependencias.length}>
                        <tr>
                            <td colSpan="3" className="text-center">
                                No hay dependencias disponibles!
                            </td>
                        </tr>
                    </Show>
                </tbody>
            </table>
        </div>
    );
}


export default SelectMultitleDependencia;
