import React, { Fragment, useContext, useEffect, useState } from 'react';
import { handleErrorRequest, projectTracking } from '../../services/apis';
import Skeleton from 'react-loading-skeleton';
import Show from '../show';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { projectTypes } from '../../contexts/project-tracking/ProjectReducer';
import { SelectPresupuesto, SelectMedida } from '../select/project_tracking';
import currencyFormatter from 'currency-formatter';
import { Button } from 'semantic-ui-react';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';
import collect from 'collect.js';

const Placelholder = () => {
    const datos = [1, 2, 3, 4, 5];
    return datos.map(d =>
        <tr key={`list-item-placeholder-gasto-${d}`}>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>
    )
}

const ItemGasto = ({ activity, gasto }) => {

    // project
    const { activities, gastos, dispatch } = useContext(ProjectContext);

    // estados
    const [current_edit, setCurrentEdit] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    const handleUpdate = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en actualizar el gasto?')
        if (!answer) return false;
        setCurrentLoading(true);
        await projectTracking.post(`gasto/${gasto.id}?_method=PUT`, form)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            let newGasto = { ...gasto, ...res.data.gasto };
            dispatch({ type: projectTypes.UPDATE_GASTO, payload: newGasto });
            setCurrentEdit(false);
        }).catch(err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
    }

    const handleDelete = async () => {
        let answer = await Confirm('warning', '¿Estas seguro en eliminar el gasto?');
        if (!answer) return false;
        setCurrentLoading(true);
        await projectTracking.post(`gasto/${gasto.id}/delete`, {})
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            dispatch({ type: projectTypes.DELETE_GASTO, payload: gasto });
        }).catch(err => handleErrorRequest(err, null));
        setCurrentLoading(false);
    }

    useEffect(() => {
        if (!current_edit) setForm(Object.assign({}, gasto));
    }, [current_edit]);

    // render
    return (
        <tr className="font-12 bg-white">
            <th>
                <Show condicion={current_edit}
                    predeterminado={gasto?.description}
                >  
                    <textarea 
                        name="description" 
                        rows="2"
                        value={form?.description}
                        onChange={(e) => handleInput(e.target)}
                    /> 
                </Show>
            </th>
            <th className="text-center">
                <Show condicion={current_edit}
                    predeterminado={gasto?.presupuesto?.ext_pptto || ""}
                >
                    <SelectPresupuesto
                        text="ext_pptto"
                        execute={true}
                        name="presupuesto_id"
                        value={form?.presupuesto_id}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </Show>
            </th>
            <th className="text-center">
                <Show condicion={current_edit}
                    predeterminado={gasto?.medida?.name_short || ""}
                >
                    <SelectMedida
                        execute={true}
                        name="medida_id"
                        value={form?.medida_id}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </Show>
            </th>
            <th className="text-right">
                <Show condicion={current_edit}
                    predeterminado={currencyFormatter.format(gasto?.monto, { code: 'PEN' })}
                >
                    <input type="number"
                        name="monto"
                        step="any"
                        value={form?.monto || 0}
                        onChange={({ target }) => {
                            if (target.value >= 0) handleInput(target);
                        }}
                    />
                </Show>
            </th>
            <th className="text-center">
                <Show condicion={current_edit}
                    predeterminado={gasto?.cantidad}
                >
                    <input type="number"
                        name="cantidad"
                        step="any"
                        value={form?.cantidad || 0}
                        onChange={({ target }) => {
                            if (target.value >= 0) handleInput(target);
                        }}
                    />
                </Show>
            </th>
            <th className="text-right">
                <Show condicion={current_edit}
                    predeterminado={currencyFormatter.format(gasto?.total, { code: 'PEN' })}
                >
                    {currencyFormatter.format((form?.cantidad * form?.monto) || 0, { code: 'PEN' })}
                </Show>
            </th>
            <td width="5%" className="text-center">
                <Button.Group size="mini">
                    <Show condicion={!gasto.verify_financiera || !gasto.verify_tecnica}
                        predeterminado={
                            <Button color="green"
                                size="mini"
                                icon="check"
                            />
                        }
                    >
                        <Button basic
                            icon={current_edit ? 'cancel' : 'edit'}
                            color={current_edit ? 'red' : 'blue'}
                            onClick={() => setCurrentEdit(prev => !prev)}
                        />

                        <Show condicion={!current_edit} 
                            predeterminado={
                                <Button color="teal"
                                    icon="save"
                                    disabled={current_loading}
                                    onClick={handleUpdate}
                                    loading={current_loading}
                                />
                            }
                        >
                            <Show condicion={!gasto?.detalles?.length}>
                                <Button basic
                                    color="red"
                                    icon="trash"
                                    onClick={handleDelete}
                                    disabled={current_loading}
                                />
                            </Show>
                        </Show>
                    </Show>
                </Button.Group>
            </td>
        </tr>
    )
}

const ListGastos = ({ activity }) => {

    // project
    const { gastos, dispatch } = useContext(ProjectContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);

    // obtener gastos
    const getGastos = async (add = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`activity/${activity.id}/gasto?page=&principal=1`)
        .then(({ data }) => {
            let payload = {
                total: data.gastos.total,
                last_page: data.gastos.lastPage,
                data: add ? [...gastos.data, ...data.gastos.data] : data.gastos.data,
            }
            // setting
            dispatch({ type: projectTypes.SET_GASTOS, payload });
        }).catch(err => console.log(err));
        setCurrentLoading(false);
    }

    useEffect(() => {
        getGastos();
    }, []);

    return (
        <Fragment>
            <Show condicion={!current_loading}
                predeterminado={<Placelholder/>}
            >
                {gastos?.data?.map((gas, indexG) => 
                    <ItemGasto key={`list-item-gasto-${indexG}`}
                        activity={activity}
                        gasto={gas}
                    />
                )}
                {/* no hay registros */}
                <Show condicion={!gastos?.total}>
                    <tr>
                        <th colSpan="11" className="text-center bg-white">No hay regístros</th>
                    </tr>
                </Show>
            </Show>
        </Fragment>
    );
}

export default ListGastos;