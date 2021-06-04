import React, { useState, useContext } from 'react';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import { Button, Input } from 'semantic-ui-react';
import ConfigScheduleProvider from '../../providers/escalafon/ConfigScheduleProvider';
import { EntityContext } from '../../contexts/EntityContext';
import { useEffect } from 'react';
import Swal from 'sweetalert2';
import { Confirm } from '../../services/utils';

// providers
const configScheduleProvider = new ConfigScheduleProvider(); 

const PlaceholderTable = () => {
    const datos = [1, 2, 3, 4];
    return datos.map(index => 
        <tr key={`list-table-clock-${index}`}>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>
    );
}

const ItemClock = ({ object = {}, onUpdate = null }) => {

    const [form, setForm] = useState(object);
    const [errors, setErrors] = useState({});
    const [edit, setEdit] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);

    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    const handleUpdate = async () => {
        let answer = await Confirm('warning', `¿Estás seguro en guardar los cambios?`);
        if (!answer) return;
        setCurrentLoading(true);
        await configScheduleProvider.update(object.id, form)
        .then(async res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            if (typeof onUpdate == 'function') await onUpdate(form);
            setEdit(false);
        }).catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
            setErrors(err.errors || {});
        });
        setCurrentLoading(false);
    }

    useEffect(() => {
        if (!edit) setForm(object);
    }, [edit]);

    return (
        <tr>
            <td>{object.id}</td>
            <td className="capitalize">
                <Show condicion={edit}
                    predeterminado={object?.name}
                >
                    <Input name="name"
                        fluid
                        value={form?.name}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </Show>
            </td>
            <td className="text-center">
                <Button.Group size="mini">
                    <Show condicion={!current_loading}
                        predeterminado={<Button active loading/>}
                    >
                        <Show condicion={!edit}
                            predeterminado={
                                <>
                                    <Button basic
                                        icon="cancel" 
                                        color="red"  
                                        onClick={() => setEdit(false)}
                                    />
                                    <Button icon="save" 
                                        color="teal"
                                        disabled={current_loading || !form.name}
                                        onClick={handleUpdate}
                                    />
                                </>
                            }
                        >
                            <Button icon="edit" 
                                onClick={() => setEdit(true)}
                            />
                            <Button icon="hourglass outline" 
                                color="black"
                                basic
                            />
                            <Button icon="trash" 
                                color="red"
                            />
                        </Show>
                    </Show>
                </Button.Group>
            </td>
        </tr>
    )
}

const listConfigSchedule = ({ datos = [], setDatos, setBlock, block }) => {

    // entity
    const { entity_id } = useContext(EntityContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [last_page, setLastPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [is_error, setIsError] = useState(false);
    const [is_refresh, setIsRefresh] = useState(false);

    // config
    const options = {
        headers: {
            EntityId: entity_id
        }
    }

    const handleRefresh = () => {
        setPage(1);
        setIsRefresh(true);
    }

    const getConfigSchedule = async (add = false) => {
        setCurrentLoading(true);
        await configScheduleProvider.index({ page }, options)
        .then(res => {
            let { config_schedules } = res.data;
            setIsError(false);
            setLastPage(config_schedules.last_page || 0);
            setTotal(config_schedules.total || 0);
            setDatos(add ? [...datos, ...config_schedules.data] : config_schedules.data);
        }).catch(err => setIsError(true))
        setCurrentLoading(false);
    }

    const handleUpdate = (index, newConfig) => {
        let newDatos = [...datos];
        newDatos[index] = newConfig;
        setDatos(newDatos);
    }

    useEffect(() => {
        getConfigSchedule();
    }, []);

    useEffect(() => {
        if (is_refresh) getConfigSchedule();
    }, [is_refresh]);

    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh]);

    // render
    return (
        <div className="card">
            <div className="card-header">
                <i className="fas fa-list"></i> Listado de Configuración de Horarios
                <span className="close cursor-pointer" onClick={handleRefresh}>
                    <i className="fas fa-sync"></i>
                </span>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th width="7%" className="text-center">ID#</th>
                                <th className="text-left">Nombre</th>
                                <th width="20%" className="text-center">Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Show condicion={!current_loading}
                                predeterminado={<PlaceholderTable/>}
                            >
                                <Show condicion={datos.length}
                                    predeterminado={
                                        <tr>
                                            <th colSpan="3" className="text-center">
                                                No hay regístros disponibles
                                            </th>
                                        </tr>
                                    }
                                >
                                    {datos?.map((d, indexD) => 
                                        <ItemClock 
                                            onUpdate={obj => handleUpdate(indexD, obj)}
                                            key={`list-data-clock-${indexD}`}
                                            object={d}
                                        />
                                    )}
                                </Show>
                            </Show>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default listConfigSchedule;