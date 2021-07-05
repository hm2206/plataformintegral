import React, { useContext, useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import ConfigDependenciaProvider from '../../providers/tramite/ConfigDependenciaProvider';
import Show from '../show';
import { EntityContext } from '../../contexts/EntityContext';
import { Button } from 'semantic-ui-react';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';

// providers
const configDependenciaProvider = new ConfigDependenciaProvider();

const Placeholder = () => {
    const datos = [1, 2, 3, 4];
    
    // render
    return datos.map((d, indexD) => 
        <tr key={`list-datos-${indexD}`}>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>
    )
}

const ItemRole = ({ dependencia, dependencia_id, onDelete = null }) => {

    // entity
    const { entity_id } = useContext(EntityContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_error, setIsError] = useState(false);

    // options
    let options = {
        headers: { 
            EntityId: entity_id 
        }
    }

    // eliminar dependencia
     const deleteDependencia = async () => {
        let answer = await Confirm('warning', `¿Estás seguro en eliminar dependencia destino?`, 'Eliminar');
        if (!answer) return false;
        setCurrentLoading(true);
        await configDependenciaProvider.delete(dependencia.id, { dependencia_id }, options)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setIsError(false);
            if (typeof onDelete == 'function') onDelete(dependencia);
        }).catch(err => setIsError(true))
        setCurrentLoading(false);
    }

    // render
    return (
        <tr>
            <td>{dependencia.id}</td>
            <td className="capitalize">
                {dependencia?.nombre}
                <span className="badge badge-sm badge-dark ml-1">
                    {dependencia?.id == dependencia_id ? 'Actual' : ''}
                </span>
            </td>
            <td className="text-center">
                <Button color="red" size="mini" 
                    onClick={deleteDependencia}
                    disabled={current_loading}
                    loading={current_loading}
                >
                    <i className="fas fa-trash"></i>
                </Button>
            </td>
        </tr>
    )
}

const ListConfigDependencia = ({ dependencia_id, is_create, setIsCreate }) => {

    // entity
    const { entity_id } = useContext(EntityContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [last_page, setLastPage] = useState(0);
    const [datos, setDatos] = useState([]);
    const [is_error, setIsError] = useState(false);
    const [refresh, setRefresh] = useState(false);

    // obtener datos
    const getDatos = async (add = false) => {
        setCurrentLoading(true);
        // options
        let options = {
            headers: { 
                EntityId: entity_id
            }
        }
        // request
        await configDependenciaProvider.dependenciaDestino(dependencia_id, { page }, options)
        .then(res => {
            let { dependencia_destinos } = res.data;
            setLastPage(dependencia_destinos.lastPage || 0);
            setDatos(add ? [...datos, ...dependencia_destinos.data] : dependencia_destinos.data);
            setIsError(false);
        }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    const handleRefresh = () => {
        if (!refresh) {
            setPage(1);
            setRefresh(true);
        }
    }
 
    // montar componente
    useEffect(() => {
        getDatos();
    }, []);

    // cambio de dependencia
    useEffect(() => {
        if (dependencia_id) {
            setPage(1);
            setLastPage(1);
            setRefresh(true);
        }
    }, [dependencia_id]);

    // refrescar
    useEffect(() => {
        if (refresh) getDatos();
    }, [refresh]);

    // disable refresh
    useEffect(() => {
        if (refresh) setRefresh(false);
    }, [refresh]);

    // enable refresh al cambio del is_create
    useEffect(() => {
        if (is_create) handleRefresh();
    }, [is_create]);

    // disable refresh al cambio del is_create
    useEffect(() => {
        if (is_create) setIsCreate(false);
    }, [is_create]);

    // next page
    useEffect(() => {
        if (page > 1) getDatos(true);
    }, [page]);

    // memos
    const isMoreDatos = useMemo(() => {
        return (page + 1) <= last_page;
    }, [page, last_page, dependencia_id]);

    // render
    return (
        <div className="card">
            <div className="card-header">
                <i className="fas fa-list"></i> Lista de Dependencias
                <span className="close cursor-pointer"
                    onClick={handleRefresh}
                >
                    <i className="fas fa-sync"></i>
                </span>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th width="7%" className="text-center">#ID</th>
                                <th>Dependencia</th>
                                <th className="text-center" width="10%">Quitar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Show condicion={!current_loading}
                                predeterminado={<Placeholder/>}
                            >
                                <Show condicion={datos.length}
                                    predeterminado={
                                        <tr>
                                            <td colSpan="5" className="text-center">No hay datos disponibles!!!</td>
                                        </tr>
                                    }
                                >
                                    {datos.map((d, indexD) => 
                                        <ItemRole key={`list-datos-${indexD}`}
                                            dependencia={d}
                                            dependencia_id={dependencia_id}
                                            onDelete={() => setRefresh(true)}
                                        />
                                    )}
                                    {/* paginador */}
                                    <tr>
                                        <td colSpan="3">
                                            <Button fluid
                                                disabled={!isMoreDatos}
                                                onClick={(e) => setPage(prev => prev + 1)}
                                            >
                                                <i className="fas fa-arrow-down"></i> Obtener más regístros
                                            </Button>
                                        </td>
                                    </tr>
                                </Show>
                            </Show>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ListConfigDependencia;