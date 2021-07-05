import React, { useContext, useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import RoleProvider from '../../providers/tramite/RoleProvider';
import Show from '../show';
import { EntityContext } from '../../contexts/EntityContext';
import { AuthContext } from '../../contexts/AuthContext';
import { Button } from 'semantic-ui-react';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';

// providers
const roleProvider = new RoleProvider();

const Placeholder = () => {
    const datos = [1, 2, 3, 4];
    
    // render
    return datos.map((d, indexD) => 
        <tr key={`list-datos-${indexD}`}>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>
    )
}

const ItemRole = ({ role, dependencia_id, onDelete = null }) => {
    // auth
    const { auth } = useContext(AuthContext);

    // entity
    const { entity_id } = useContext(EntityContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_error, setIsError] = useState(false);

    // options
    let options = {
        headers: { 
            EntityId: entity_id,
            DependenciaId: dependencia_id 
        }
    }

    // disabled role
    const disabledRole = async () => {
        let answer = await Confirm('warning', `¿Estás seguro en deshabilitar el rol?`, 'Estoy seguro');
        if (!answer) return false;
        setCurrentLoading(true);
        await roleProvider.disabled(role.id, {}, options)
        .then(res => {
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            setIsError(false);
            if (typeof onDelete == 'function') onDelete(role);
        }).catch(err => setIsError(true))
        setCurrentLoading(false);
    }

    // render
    return (
        <tr>
            <td>{role.id}</td>
            <td>{role.user?.username || ""}</td>
            <td className="capitalize">
                {role.user?.person?.fullname}
                <span className="badge badge-sm badge-dark ml-1">
                    {role.user?.id == auth.id ? 'Yo' : ''}
                </span>
            </td>
            <td>{role.level}</td>
            <td className="text-center">
                <Button color="red" size="mini"
                    disabled={current_loading}
                    onClick={disabledRole}
                    loading={current_loading}
                >
                    <i className="fas fa-times"></i>
                </Button>
            </td>
        </tr>
    )
}

const ListRole = ({ dependencia_id, is_create, setIsCreate }) => {

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
                EntityId: entity_id,
                DependenciaId: dependencia_id 
            }
        }
        // request
        await roleProvider.index({ page, dependencia_id }, options)
        .then(res => {
            let { roles } = res.data;
            setLastPage(roles.lastPage || 0);
            setDatos(add ? [...datos, ...roles.data] : roles.data);
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

    // render
    return (
        <div className="card">
            <div className="card-header">
                <i className="fas fa-list"></i> Lista de roles
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
                                <th width="27%">Usuario</th>
                                <th>Persona</th>
                                <th width="15%">Nivel</th>
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
                                            role={d}
                                            dependencia_id={dependencia_id}
                                            onDelete={() => setRefresh(true)}
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

export default ListRole;