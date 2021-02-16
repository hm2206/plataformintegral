import React, { useState, useEffect } from 'react';
import Modal from '../../modal';
import { Form, Select, Button } from 'semantic-ui-react';
import { SelectEntityUser, SelectEntityDependenciaUser } from '../../select/authentication';
import { authentication } from '../../../services/apis';
import Show from '../../show';
import { Confirm } from '../../../services/utils';
import Swal from 'sweetalert2'
import Collect from 'collect.js';


const ConfigEntityDependencia = ({ user, isClose }) => {

    const [config_entity_id, setConfigEntityId] = useState("");
    const [entity_id, setEntityId] = useState("");
    const [dependencia_id, setDependenciaId] = useState("");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [datos, setDatos] = useState([]);
    const [is_refresh, setIsRefresh] = useState(false);

    const getDependencias = async (nextPage = 1, add = false) => {
        setLoading(true);
        await authentication.get(`user/${user.id}/entity/${entity_id}/dependencia?page=${nextPage}`)
            .then(async res => {
                let { success, message, dependencia } = res.data;
                if (!success) throw new Error(message);
                // update
                setPage(dependencia.page);
                setTotal(dependencia.total);
                setLastPage(dependencia.lastPage);
                await setDatos(add ? [...datos, ...dependencia.data] : dependencia.data);
            }).catch(err => console.log(err.message));
        setLoading(false);
    }

    const createDependencia = async () => {
        let answer = await Confirm('warning', `¿Deseas guardar al dependencia?`, 'Confirmar');
        if (answer) {
            setLoading(true);
            await authentication.post(`config_entity_dependencia`, { config_entity_id, dependencia_id })
                .then(async res => {
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    await getDependencias();
                    setConfigEntityId("");
                    setEntityId("");
                    setDependenciaId("");
                    setIsRefresh(true);
                }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
            setIsRefresh(false);
            setLoading(false);
        }
    }

    const deleteDependencia = async (id) => {
        let answer = await Confirm('warning', `¿Deseas eliminar al dependencia?`, 'Eliminar');
        if (answer) {
            setLoading(true);
            await authentication.post(`config_entity_dependencia/${id}?_method=DELETE`)
                .then(async res => {
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message });
                    await getDependencias();
                    setIsRefresh(true);
                }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
            setLoading(false);
            setIsRefresh(false);
        }
    }
    
    const handleEntity = async (obj) => {
        setEntityId(obj.value);
        let options = Collect(obj.options);
        let newObj = await options.where("value", obj.value).first();
        setConfigEntityId(newObj.obj && newObj.obj.config_entity_id || "");
    }

    useEffect(() => {
        const fetchig = async () => {
            await getDependencias();
        } 
        // execute
        fetchig();
    }, [entity_id]);

    return <Modal show 
        md="10"
        titulo={<span><i className="fas fa-cog"></i> Configurar Dependencia</span>}
        isClose={isClose}
    >
        <div className="card-body">
            <Form loading={loading}>
                <div className="row">
                    <div className="col-md-6 mb-1">
                        <SelectEntityUser
                            user_id={user && user.id}
                            name="entity_id"
                            value={entity_id || ""}
                            onChange={(e, obj) => handleEntity(obj)}
                            refresh={is_refresh}
                        />
                    </div>

                    <div className="col-md-4 mb-1">
                        <SelectEntityDependenciaUser
                            user_id={user && user.id}
                            entity_id={entity_id || ""}
                            execute={false}
                            disabled={!entity_id}
                            name="dependencia_id"
                            value={dependencia_id}
                            refresh={entity_id}
                            except={1}
                            onChange={(e, obj) => setDependenciaId(obj.value)}
                        />
                    </div>

                    <div className="col-md-2 mb-1">
                        <Button fluid
                            color="teal"
                            disabled={loading || !config_entity_id}
                            onClick={async (e) => await createDependencia()}
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
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th className="text-right">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <Show condicion={!loading && !datos.length}>
                                        <tr>
                                            <th colSpan="4" className="text-center">
                                                No hay registros 
                                                <button className="ml-2 btn btn-sm btn-outline-primary"
                                                    onClick={async (e) => await getDependencias()}
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
                                                <td className="uppercase">{d.nombre}</td>
                                                <td>{d.descripcion}</td>
                                                <td className="text-right">
                                                    <button className="btn btn-sm btn-red"
                                                        onClick={async (e) => await deleteDependencia(d.config_entity_dependencia_id)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>    
                                        )}
                                        <tr>
                                            <td colSpan="4">
                                                <Button fluid
                                                    disabled={loading || !(lastPage > page)}
                                                    onClick={async (e) => await getDependencias(page + 1, true)}
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

export default ConfigEntityDependencia;