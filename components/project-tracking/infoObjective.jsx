import React, { useContext, useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';
import currencyFormatter from 'currency-formatter';
import Show from '../show';
import { Confirm } from '../../services/utils';
import { projectTracking, handleErrorRequest } from '../../services/apis';
import Swal from 'sweetalert2';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { projectTypes } from '../../contexts/project-tracking/ProjectReducer';
import AddActivity from './addActivity';
import CoinActivity from './coinActivity';

const actions = {
    activities: 'activities',
    gastos: 'gastos'
};

const InfoObjective = ({ objective }) => {

    // objectives
    const { objectives, dispatch } = useContext(ProjectContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_edit, setCurrentEdit] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [option, setOption] = useState("");

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }
    
    const handleSave = async () => {
        let answer = await Confirm('warning', '¿Estás seguro en guardar los cambios?', 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        let payload = {};
        payload.title = form.title;
        await projectTracking.post(`objective/${objective.id}/update`, payload)
        .then(async res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            let newObjectives = Object.assign({}, objectives);
            newObjectives.data = await newObjectives.data.map(obj => {
                if (obj.id == objective.id) obj = form;
                return obj;
            });
            // updating
            dispatch({ type: projectTypes.SET_OBJECTIVES, payload: newObjectives });
            setCurrentEdit(false);
        }).catch(err => handleErrorRequest(err, setErrors));
        setCurrentLoading(false);
    }

    useEffect(() => {
        if (current_edit) setForm(Object.assign({}, objective));
    }, [current_edit]);

    // render
    return (
        <tr>
            <td>
                <Show condicion={current_edit}
                    predeterminado={<span><b className="mr-1">{objective?.index}.-</b> {objective?.title}</span>}
                >
                    <textarea type="text" 
                        rows="4"
                        value={form?.title}
                        name="title"
                        onChange={(e) => handleInput(e.target)}
                    />
                </Show>
            </td>
            <td width="15%">{currencyFormatter.format(objective?.total, { code: 'PEN' })}</td>
            <td width="10%">
                <Button.Group vertical labeled icon size="small">
                    <Show condicion={!current_edit}
                        predeterminado={
                            <>
                                <Button icon='cancel' color="red" content='Cancelar' onClick={() => setCurrentEdit(false)}/>
                                <Button icon='save' color="blue" content='Guardar' onClick={handleSave}/>
                            </>
                        }
                    >
                        <Button icon='edit' content='Editar' onClick={() => setCurrentEdit(true)}/>
                        <Button icon='time' content='Actividades' onClick={() => setOption(actions.activities)}/>
                        <Button icon='cart arrow down' content='Gastos' onClick={() => setOption(actions.gastos)}/>
                    </Show>
                </Button.Group>
                {/* acciones */}
                <Show condicion={option == actions.activities}>
                    <AddActivity 
                        isClose={(e) => setOption("")}
                        objective={objective}
                    />
                </Show> 

                <Show condicion={option == actions.gastos}>
                    <CoinActivity 
                        isClose={(e) => setOption("")}
                        objective={objective}
                        onCreate={(e) => getComponentes()}
                    />
                </Show> 
            </td>
        </tr>
    )
}

export default InfoObjective;