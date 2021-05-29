import React, { useState, useContext } from 'react';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import ClockProvider from '../../providers/escalafon/ClockProvider';
import { EntityContext } from '../../contexts/EntityContext';
import { useEffect } from 'react';

// providers
const clockProvider = new ClockProvider(); 

const PlaceholderTable = () => {
    const datos = [1, 2, 3, 4];
    return datos.map(index => 
        <tr key={`list-table-clock-${index}`}>
            <td><Skeleton/></td>
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
            <td className="text-center">{object.host}</td>
            <td className="text-center">{object.port}</td>
        </tr>
    )
}

const ListClock = ({ datos = [], setDatos, setBlock, block }) => {

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

    const getClock = async (add = false) => {
        setCurrentLoading(true);
        await clockProvider.index({ page }, options)
        .then(res => {
            let { clocks } = res.data;
            setIsError(false);
            setLastPage(clocks.last_page || 0);
            setTotal(clocks.total || 0);
            setDatos(add ? [...datos, ...clocks.data] : clocks.data);
        }).catch(err => setIsError(true))
        setCurrentLoading(false);
    }

    useEffect(() => {
        getClock();
    }, []);

    useEffect(() => {
        if (is_refresh) getClock();
    }, [is_refresh]);

    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh]);

    // render
    return (
        <div className="card">
            <div className="card-header">
                <i className="fas fa-list"></i> Listado de Reloj Biométrico
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
                                <th width="20%" className="text-center">Host</th>
                                <th width="10%" className="text-center">Puerto</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Show condicion={!current_loading}
                                predeterminado={<PlaceholderTable/>}
                            >
                                <Show condicion={datos.length}
                                    predeterminado={
                                        <tr>
                                            <th colSpan="4" className="text-center">
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

export default ListClock;