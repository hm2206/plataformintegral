import React, { useState, useContext, useMemo } from 'react';
import { Button, Select, TextArea } from 'semantic-ui-react';
import AssistanceProvider from '../../providers/escalafon/AssistanceProvider';
import moment from 'moment';
import Show from '../show';
import Swal from 'sweetalert2';
import { Confirm } from '../../services/utils';
import { AssistanceContext } from '../../contexts/escalafon/AssistanceContext';
import { assistanceTypes } from '../../contexts/escalafon/AssistanceReducer';
moment.locale('es');

// providers
const assistanceProvider = new AssistanceProvider();

const typeStatus = {
    ENTRY: {
        text: "Entrada",
        className: "badge badge-primary"
    },
    EXIT: {
        text: "Salida",
        className: "badge badge-danger"
    }
}

const ItemAssistance = ({ index, assistance = {}, group = false }) => {

    // assistance
    const { dispatch } = useContext(AssistanceContext);

    const current_status = typeStatus[assistance.status] || {};

    // estados
    const [form, setForm] = useState(assistance);
    const [current_loading, setCurrentLoading] = useState(false);
    const [edit, setEdit] = useState(false);

    const handleUpdate = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en guardar los cambios?`);
        if (!answer) return;
        setCurrentLoading(true);
        await assistanceProvider.update(assistance.id, form)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            setEdit(false);
            dispatch({ type: assistanceTypes.UPDATE_ASSISTANCE, payload: form });
        }).catch(async err => await Swal.fire({ icon: 'error', text: err.message }));
        setCurrentLoading(false);
    }

    const handleDelete = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en ocultar la asistencia?`);
        if (!answer) return;
        setCurrentLoading(true);
        await assistanceProvider.delete(assistance.id)
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            dispatch({ type: assistanceTypes.DELETE_ASSISTANCE, payload: assistance.id });
        }).catch(async err => await Swal.fire({ icon: 'error', text: err.message }));
        setCurrentLoading(false);
    }

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    const displayFecha = useMemo(() => {
        let format = moment(assistance?.schedule?.date, 'YYYY-MM-DD');
        return format.isValid() ? format.format('DD/MM/YYYY') : null;
    }, [assistance])

    // render
    return (
        <tr style={{ borderBottom: group ? '2px solid #000' : '' }}>
            <td>{index + 1}</td>
            <td className="capitalize">{assistance?.person?.fullname}</td>
            <td className="text-center">{displayFecha}</td>
            <td className="text-center">
                <span className="badge badge-dark"> 
                    <i className="fas fa-clock mr-1"></i>
                    {assistance.record_time}
                </span>
            </td>
            <td className="text-center">
                <span className={current_status.className}>
                    {current_status.text}
                </span>
            </td>
            <td className="text-center">
                <Show condicion={edit}
                    predeterminado={form?.description}
                >
                    <TextArea name="description"
                        className="form-control"
                        value={form.description || ""}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </Show>
            </td>
            <td className="text-center">
                <Show condicion={!current_loading}
                    predeterminado={
                        <Button size="mini">
                            <i className="fas fa-spinner fa-pulse"></i>
                        </Button>
                    }
                >
                    <Button.Group size="mini">
                        <Show condicion={!edit}>
                            <Button onClick={() => setEdit(true)}>
                                <i className="fas fa-pencil-alt"></i>
                            </Button>

                            <Button color="red" 
                                basic
                                onClick={handleDelete}
                            >
                                <i className="fas fa-times"></i>
                            </Button>
                        </Show>
                        {/* editar */}
                        <Show condicion={edit}>
                            <Button color="red"
                                basic
                                onClick={() => setEdit(false)}
                            >
                                <i className="fas fa-times"></i>
                            </Button>

                            <Button color="teal" onClick={handleUpdate}>
                                <i className="fas fa-save"></i>
                            </Button>
                        </Show>
                    </Button.Group>
                </Show>
            </td>
        </tr>
    )
}

export default ItemAssistance;