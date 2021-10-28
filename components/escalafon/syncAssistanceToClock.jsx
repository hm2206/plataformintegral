import React, { useState, useContext } from 'react';
import Modal from '../modal';
import { Button } from 'semantic-ui-react';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import ClockProvider from '../../providers/escalafon/ClockProvider';
import { EntityContext } from '../../contexts/EntityContext';
import { useEffect } from 'react';
import { AssistanceContext } from '../../contexts/escalafon/AssistanceContext';

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

const ItemClock = ({ object = {} }) => {

    // estado
    const [current_clock, setCurrentClock] = useState(object);
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_error, setIsError] = useState(false);

    // render
    return (
        <tr>
            <td className="text-center">{current_clock.id}</td>
            <td className="capitalize">{current_clock.name}</td>
            <td className="text-center">{current_clock.host}</td>
            <td className="text-center">
                <Show condicion={!current_clock?.sync}
                    predeterminado={
                        <Button 
                            size="mini"
                            disabled={current_loading}
                            color="orange"
                        >
                            <i className="fas fa-sync-alt fa-spin"></i>
                        </Button> 
                    }
                >
                    <Button color="black" 
                        size="mini"
                        disabled={true}
                    >
                        <i className="fas fa-arrow-down"></i>
                    </Button>
                </Show>
            </td>
        </tr>
    )
}

const SyncAssistanceToClock = ({ onClose = null, year = null, month = null }) => {

    // entity
    const { entity_id } = useContext(EntityContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
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

    return (
        <Modal show={true}
            isClose={onClose}
            titulo="Sincronizar asistencia con el reloj biométrico"
        >
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th className="text-center" width="7%">
                                    <i className="fas fa-sync text-primary cursor-pointer" 
                                        onClick={() => !current_loading ? handleRefresh() : null}
                                    />
                                </th>
                                <th>Nombre</th>
                                <th>Host</th>
                                <th className="text-center" width="10%">Sincronizar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Show condicion={!current_loading}
                                predeterminado={<PlaceholderTable/>}
                            >
                                <Show condicion={datos.length}
                                    predeterminado={
                                        <tr>
                                            <th colSpan="4" className="text-center">No hay regístros disponibles</th>
                                        </tr>
                                    }
                                >
                                    {datos.map((d, indexD) => 
                                        <ItemClock object={d}
                                            key={`item-clock-sync-${indexD}`}
                                        />
                                    )}
                                </Show>
                            </Show>
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    )
}

export default SyncAssistanceToClock;