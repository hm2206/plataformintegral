import React, { useContext, useEffect, useState } from 'react';
import TableMeses from './tableMes';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import Show from '../show';
import { projectTracking, handleErrorRequest } from '../../services/apis';
import { Button } from 'semantic-ui-react';
import collect from 'collect.js';
import { projectTypes } from '../../contexts/project-tracking/ProjectReducer';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';

const ItemActivity = ({ activity, plan_trabajo = {} }) => {

    // project
    const { project, dispatch } = useContext(ProjectContext);

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
        let answer = await Confirm("warning", `¿Deseas guardar los datos?`, 'Guardar');
        if (!answer) return false;
        setCurrentLoading(true);
        let payload = Object.assign({}, form);
        payload.programado = JSON.stringify(payload.programado);
        payload.plan_trabajo_id = plan_trabajo.id || null;
        await projectTracking.post(`activity/${activity.id}/update`,  payload)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            dispatch({ type: projectTypes.UPDATE_ACTIVITY, payload: form });
            setCurrentEdit(false);
        })
        .catch(err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
    }

    const handleProgramacion = async ({ data }) => {
        let payload = collect(data).pluck('value').toArray();
        setForm({ ...form, programado: payload });
    }

    useEffect(() => {
        if (!current_edit) setForm(Object.assign({}, activity));
    }, [current_edit]);

    // render
    return (
        <tr>
            <td>
                <Show condicion={current_edit}
                    predeterminado={activity?.title}
                >
                    <textarea
                        placeholder="Titulo de la actividad"
                        name="title"
                        value={form?.title || ""}
                        rows="2"
                        disabled={!current_edit}
                        onChange={(e) => handleInput(e.target)}
                    />
                </Show>
            </td>
            <td>
                <TableMeses 
                    rows={project?.duration}
                    isHeader={false}
                    defaultPosition={form?.programado || []}
                    onChecked={handleProgramacion}
                    disabled={!current_edit}
                />
            </td>
            <Show condicion={project?.state != 'OVER' && project?.state != 'PREOVER'}>
                <td>
                    <Button.Group size='mini'>
                        <Button color={current_edit ? 'red': 'blue'}
                            onClick={(e) => setCurrentEdit((prev) => !prev)}
                            icon={current_edit ? 'cancel' : 'pencil'}
                        />
            
                        <Show condicion={current_edit}
                            predeterminado={
                                <Button color="red" 
                                    icon="trash" 
                                />
                            }
                        >
                            <Button color="teal" 
                                icon="save" 
                                onClick={handleUpdate}
                            />
                        </Show>
                    </Button.Group>
                </td>
            </Show>
        </tr>
    )
}

export default ItemActivity;