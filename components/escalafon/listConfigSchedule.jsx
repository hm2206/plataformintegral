import React, { useState, useContext } from 'react';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import ConfigScheduleProvider from '../../providers/escalafon/ConfigScheduleProvider';
import { EntityContext } from '../../contexts/EntityContext';
import { useEffect } from 'react';

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

const ItemClock = ({ object }) => {
    return (
        <tr>
            <td>{object.id}</td>
            <td className="capitalize">{object.name}</td>
            <td className="text-center"></td>
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