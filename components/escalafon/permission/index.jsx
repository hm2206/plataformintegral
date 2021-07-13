import React, { useState, useEffect, Fragment, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import Show from '../../show';
import CreatePermission from './createPermission';
import { BtnFloat } from '../../Utils';
import ItemPermission from './itemPermission';
import WorkProvider from '../../../providers/escalafon/WorkProvider';
import { Button } from 'semantic-ui-react';

const workProvider = new WorkProvider();

const Placeholder = () => {

    const datos = [1, 2, 3, 4];

    return <Fragment>
        <div className="col-md-12"></div>
        {datos.map((d, indexD) => 
            <div className="col-md-6 mb-3" key={`placeholder-contrato-${indexD}`}>
                <Skeleton height="50px"/>
                <Skeleton height="150px"/>
            </div>
        )}
    </Fragment>
}

const Permission = ({ work }) => {

    const options = {
        CREATE: "create",
        EDIT: "edit"
    }

    const [option, setOption] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_data, setCurrentData] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [error, setError] = useState(false);
    const [is_refresh, setIsRefresh] = useState(true);

    const isNextPage = useMemo(() => {
        return (current_page + 1) <= current_last_page;
    }, [current_data]);

    // obtener permissions
    const getDatos = async (add = false) => {
        setCurrentLoading(true);
        await workProvider.permissions(work.id, { page: current_page })
        .then(res => {
            let { success, message, permissions } = res.data;
            if (!success) throw new Error(message);
            setError(false);
            setCurrentTotal(permissions.total);
            setCurrentLastPage(permissions.lastPage);
            setCurrentData(add ? [...current_data, ...permissions.data] : permissions.data);
        })
        .catch(() => setError(true))
        setCurrentLoading(false);
    }

    const onSave = async () => {
        setOption("");
        getDatos();
    }

    const onUpdate = async (permission) => {
        let newDatos = [];
        await current_data?.filter(d => {
            if (d.id == permission.id) newDatos.push(permission);
            else newDatos.push(d);
            return d;
        });
        
        setCurrentData(newDatos);
    }

    const onDelete = async () => {
        setOption("");
        getDatos();
    }

    useEffect(() => {
        if (current_page > 1) getDatos(true);
    }, [current_page]);

    // primera carga
    useEffect(() => {
        if (is_refresh) getDatos();
    }, [is_refresh]);

    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh]);

    // render
    return <div className="row">
        <div className="col-md-12">
            <h5>
                Listado de Permisos
                <Show condicion={!current_loading}>
                    <span className="close cursor-pointer"
                        onClick={() => {
                            setCurrentPage(1);
                            setIsRefresh(true);
                        }}
                    >
                        <i className="fas fa-sync"></i>
                    </span>
                </Show>
            </h5>
            <hr/>
        </div>
        
        {current_data.map((d, indexD) => 
            <div className="col-md-6" key={`grado-lista-${indexD}`}>
                <ItemPermission permission={d}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            </div>    
        )}

        {/* no hay registros */}
        <Show condicion={!current_loading && !current_data?.length}>
            <div className="col-12 text-center">
                <b>No hay regístros disponibles</b>
            </div>
        </Show>  

        <Show condicion={current_loading}>
            <Placeholder/>
        </Show>

        <Show condicion={isNextPage}>
            <div className="col-12">
                <Button onClick={() => setCurrentPage(prev => prev + 1)} fluid>
                    <i className="fas fa-arrow-down"></i> Obtener más regístros
                </Button>
            </div>
        </Show>

        <BtnFloat onClick={() => setOption(options.CREATE)}>
            <i className="fas fa-plus"></i>
        </BtnFloat>

        <Show condicion={option == options.CREATE}>
            <CreatePermission
                work={work}
                onClose={() => setOption("")}
                onSave={onSave}
            />
        </Show>
    </div>
}

// export 
export default Permission;