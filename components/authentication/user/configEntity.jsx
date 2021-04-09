import React, { useState, useEffect } from 'react';
import Modal from '../../modal';
import { Form, Button } from 'semantic-ui-react';
import { SelectEntity } from '../../select/authentication';
import { authentication } from '../../../services/apis';
import Show from '../../show';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2';


const ConfigEntity = ({ user, isClose }) => {

    const [entity_id, setEntityId] = useState("");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [datos, setDatos] = useState([]);
    const [is_refresh, setIsRefresh] = useState(false);

    const getEntity = async (nextPage = 1, add = false) => {
        setLoading(true);
        await authentication.get(`user/${user.id}/entity?page=${nextPage}`)
            .then(async res => {
                let { success, messsage, entities } = res.data;
                if (!success) throw new Error(message);
                // update
                setPage(entities.page);
                setTotal(entities.total);
                setLastPage(entities.lastPage);
                await setDatos(add ? [...datos, ...entities.data] : entities.data);
            }).catch(err => console.log(err.message));
        setLoading(false);
    }

    const createEntity = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar al entidad?`, 'Agregar');
        if (answer) {
            setLoading(true);
            await authentication.post(`config_entity`, { entity_id, user_id: user.id })
                .then(async res => {
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    await getEntity();
                    setEntityId("");
                    setIsRefresh(true);
                }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
            setIsRefresh(false);
            setLoading(false);
        }
    }

    const deleteEntity = async (id) => {
        let answer = await Confirm('warning', `¿Deseas eliminar al entidad?`, 'Eliminar');
        if (answer) {
            setLoading(true);
            await authentication.post(`config_entity/${id}/delete`)
                .then(async res => {
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    await getEntity(page);
                    setIsRefresh(true);
                }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
            setLoading(false);
            setIsRefresh(false);
        }
    }

    useEffect(() => {
        const fetchig = async () => {
            await getEntity();
        } 
        // execute
        fetchig();
    }, []);

    return <Modal show 
        titulo={<span><i className="fas fa-cog"></i> Configurar Entidad</span>}
        isClose={isClose}
    >
        <div className="card-body">
            <Form loading={loading}>
                <div className="row">
                    <div className="col-md-8 mb-1">
                        <SelectEntity 
                            name="entity_id"
                            value={entity_id}
                            onChange={(e, obj) => setEntityId(obj.value)}
                            refresh={is_refresh}
                        />
                    </div>

                    <div className="col-md-4 mb-1">
                        <Button fluid
                            color="teal"
                            disabled={loading || !entity_id}
                            onClick={(e) => createEntity()}
                        >
                            <i className="fas fa-plus"></i> Agregar
                        </Button>
                    </div>

                    <div className="col-md-12">
                        <hr/>
                    </div>

                    <div className="col-md-12 mt-3">
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>#ID</th>
                                        <th>Descripción</th>
                                        <th className="text-right">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <Show condicion={!loading && !datos.length}>
                                        <tr>
                                            <th colSpan="3" className="text-center">
                                                No hay registros 
                                                <button className="ml-2 btn btn-sm btn-outline-primary"
                                                    onClick={async (e) => await getEntity()}
                                                >
                                                    <i className="fas fa-sync"></i>
                                                </button>
                                            </th>
                                        </tr>
                                    </Show>

                                    <Show condicion={datos.length}>
                                        {datos.map(d => 
                                            <tr key={`entity-table-user-${d.id}`}>
                                                <td>{d.id}</td>
                                                <td className="uppercase">{d.name}</td>
                                                <td className="text-right">
                                                    <button className="btn btn-sm btn-red"
                                                        onClick={(e) => deleteEntity(d.config_entity_id)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>    
                                        )}
                                        <tr>
                                            <td colSpan="3">
                                                <Button fluid
                                                    disabled={loading || !(lastPage > page)}
                                                    onClick={async (e) => await getEntity(page + 1, true)}
                                                >
                                                    <i className="fas fa-arrow-down"></i> Obtener más registros
                                                </Button>
                                            </td>
                                        </tr>
                                    </Show>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Form>
        </div>
    </Modal>
}

export default ConfigEntity;