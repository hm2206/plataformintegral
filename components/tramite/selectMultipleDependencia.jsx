import React, { useState } from 'react';
import { Checkbox, Button } from 'semantic-ui-react';
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
