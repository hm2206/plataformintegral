import React, { useState, useEffect } from 'react';
import { Button, Form, Checkbox } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import Show from '../show';
import moment from 'moment';

// componente de tabla de meses seún duración
const TableMeses = ({ rows = 1, title, onChecked, isHeader = true, refresh = false, disabled = false, defaultPosition = [], onReady, dateInitial = moment().format('YYYY-MM-DD') }) => {

    const isDefault = defaultPosition.length;
    
    // estados
    const [current_rows, setCurrentRows] = useState([]);

    // generar filas
    const generateRows = async () => {
        let newRows = [];
        for(let i = 0; i < rows; i++) {
            if (isDefault) {
                let value = i + 1;
                // add
                await  newRows.push({
                    index: i,
                    value,
                    checked: defaultPosition.includes(value) ? true : false
                });
            } else {
                await  newRows.push({
                    index: i,
                    value: i + 1,
                    checked: false
                });
            }
        }
        // assignar
        setCurrentRows(newRows);
        // listo
        if (typeof onReady == 'function') onReady(newRows);
    }

    // seleccionar casillero
    const handleCheck = async (index, checked) => {
        let newCurrentRows = JSON.parse(JSON.stringify(current_rows));
        let newObj = newCurrentRows[index];
        newObj.checked = checked;
        newCurrentRows[index] = newObj;
        let range_start = {};
        let range_over = {};
        // filtrar solo checked
        let obj_checked = await newCurrentRows.filter(e => e.checked);
        let is_checked = obj_checked.length
        // validar rango de selección
        // if (is_checked) {
        //     // rangos de selección
        //     range_start = obj_checked[0];
        //     range_over = obj_checked[is_checked - 1];
        //     // validar selección masiva
        //     if (range_start.index < newObj.index && range_over.index > newObj.index) {
        //         // deseleccionar
        //         for(let initial = newObj.index; initial <= range_over.index; initial++) {
        //             obj_checked.splice(initial, 1);
        //             newCurrentRows[initial].checked = false;
        //         }
        //         // validar ultimo valor
        //         obj_checked.pop();
        //         // nuevo ultimo valor
        //         range_over = obj_checked[obj_checked.length - 1];
        //     } else {
        //         // seleccionar masivamente
        //         if (range_start.index + 1 < range_over.index) {
        //             for(let initial = range_start.index; initial < range_over.index; initial++) {
        //                 newCurrentRows[initial].checked = true;
        //             }
        //         }
        //     }
        // }
        // disparar checked
        if (typeof onChecked == 'function') onChecked({ count: is_checked, data: obj_checked, start: range_start.value, over: range_over.value });
        setCurrentRows(newCurrentRows);
    }

    // generar filas cada vez que se modifique el row
    useEffect(() => {
        if (rows) generateRows();
    }, [rows]);

    // refrescar el generador de filas
    useEffect(() => {
        if (refresh) generateRows();
    }, [refresh]);

    useEffect(() => {
        if (defaultPosition?.length) generateRows();
    }, [defaultPosition]);

    // render
    return <div className="table-responsive">
        <table className="w-100">
            <tbody>
                <Show condicion={title}>
                    <tr>
                        <th colSpan={current_rows.length} className="text-center">{title}</th>
                    </tr>
                </Show>

                <Show condicion={isHeader}>
                    <tr>
                        {current_rows.map(r => 
                            <th key={`table-rows-select-header-${r.index}`} className="text-center" width="5%">
                                {`${moment(dateInitial).add(r.index, "month").format("MMMM")}`.substr(0, 3)}
                            </th>    
                        )}
                    </tr>
                    <tr>
                        {current_rows.map(r => 
                            <th key={`table-rows-select-header-${r.index}`} className="text-center" width="5%">{r.value}</th>    
                        )}
                    </tr>
                </Show>
                <tr>
                    {current_rows.map(r => 
                        <td key={`table-rows-select-body-${r.index}`} width="5%">
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <div style={{ 
                                        width: "20px", height: "20px", 
                                        background: r.checked ? '#ffb300' : 'transparent', display: 'flex', 
                                        justifyContent: 'center', alignItems: 'center',
                                        border: "1px solid #000",
                                        borderRadius: '0.3em',
                                        opacity: disabled ? 0.3 : 1
                                    }}
                                    className={disabled ? '' : 'cursor-pointer'}
                                    onClick={(e) => !disabled ? handleCheck(r.index, !r.checked) : null}
                                />
                            </div>
                        </td>    
                    )}
                </tr>
            </tbody>
        </table>
    </div>
}

export default TableMeses;