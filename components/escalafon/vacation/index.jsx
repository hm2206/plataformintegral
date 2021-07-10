import React, { useEffect, useMemo, useState } from 'react';
import ConfigVacationProvider from '../../../providers/escalafon/ConfigVacationProvider';
import Skeleton from 'react-loading-skeleton';
import Show from '../../show';
import moment from 'moment';
import CreateVacation from './createVacation';
import { Button } from 'semantic-ui-react';
import EditVacation from './editVacation';

const Placeholder = () => {
    const datos = [1, 2, 3, 4];
    return datos.map(d => 
        <tr key={`list-datos-${d}`}>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>    
    )
}

// providers
const configVacationProvider = new ConfigVacationProvider();

const Vacation = ({ config_vacation, info }) => {

    const options = {
        CREATE: 'create',
        EDIT: 'edit',
    }

    const [option, setOption] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [last_page, setLastPage] = useState(0);
    const [datos, setDatos] = useState([]);
    const [is_error, setIsError] = useState(false);
    const [is_refresh, setIsRefresh] = useState(true);
    const [current_vacation, setCurrentVacation] = useState({});

    const getVacations = async (add = false) => {
        setCurrentLoading(true);
        await configVacationProvider.vacations(config_vacation.id, { page })
        .then(res => {
            let { vacations } = res.data;
            setIsError(false);
            setPage(vacations.page || 1);
            setLastPage(vacations.lastPage || 0);
            setDatos(add ? [...datos, ...vacations.data] : vacations.data);
        }).catch(err => setIsError(true))
        setCurrentLoading(false);
    }

    const handleRefresh = () => {
        setPage(1);
        setIsRefresh(true);
    }
    
    const handleEdit = (vacation) => {
        setOption(options.EDIT);
        setCurrentVacation(vacation);
    }

    const onSave = () => {
        setOption("");
        setPage(1);
        setIsRefresh(true)
    }

    const onUpdate = (vacation) => {
        setIsRefresh(true)
        setCurrentVacation(vacation)
    }

    const onDelete = () => {
        setOption("");
        setCurrentVacation({});
        setIsRefresh(true);
    }

    const isMoreDatos = useMemo(() => {
        return (page + 1) <= last_page;
    }, [datos])

    useEffect(() => {
        if (config_vacation?.id) setIsRefresh(true);
    }, [config_vacation?.id]);
    
    useEffect(() => {
        if (is_refresh) getVacations()
    }, [is_refresh]);

    useEffect(() => {
        if (page > 1) getVacations(true);
    }, [page]);

    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh]);

    return (
        <div className="card">
            <div className="card-header">
                <i className="fas fa-calendar"></i> Vacaciones
                <span className="close cursor-pointer"
                    onClick={handleRefresh}
                >
                    <i className="fas fa-sync"></i>
                </span>
            </div>
            
            <div className="card-body">
                <div className="table-responsive">
                    <Show condicion={datos.length}>
                        <div className="text-right">
                            <b className="text-muted"><u>Doble click en las vacaciones para editar</u></b>
                        </div>
                    </Show>

                    <table className="table">
                        <thead>
                            <tr>
                                <th width="50px">
                                    <Button size="mini" 
                                        basic
                                        color="green"
                                        onClick={() => setOption(options.CREATE)}
                                    >
                                        <i className="fas fa-plus"></i>
                                    </Button>
                                </th>
                                <th>Resolución</th>
                                <th width="100px">F. Inicio</th>
                                <th width="100px">F. Fin</th>
                                <th width="150px" className="text-center">Días usados</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* datos */}
                            {datos.map((d, indexD) => 
                                <tr key={`lista-datos-${d.id}`} className="cursor-pointer"
                                    onDoubleClick={() => handleEdit(d)}
                                >
                                    <td>{indexD + 1}</td>
                                    <td>{d.resolucion}</td>
                                    <td>{moment(d.date_start).format('DD/MM/YYYY')}</td>
                                    <td>{moment(d.date_over).format('DD/MM/YYYY')}</td>
                                    <td className="text-center">{d.days_used}</td>
                                </tr>
                            )}
                            {/* no hay datos  */}
                            <Show condicion={!current_loading && !datos.length}>
                                <tr>
                                    <th colSpan="5" 
                                        className="text-center"
                                    >
                                        No hay regístros disponibles
                                    </th>
                                </tr>
                            </Show>
                            {/* preloading */}
                            <Show condicion={current_loading}>
                                <Placeholder/>
                            </Show>
                            {/* obtener más registros */}
                            <Show condicion={isMoreDatos}>
                                <tr>
                                    <th colSpan="5">
                                        <Button basic
                                            fluid
                                            onClick={() => setPage(prev => prev + 1)}
                                        >
                                            <i className="fas fa-arrow-down"></i> Obtener más regístros
                                        </Button>
                                    </th>
                                </tr>
                            </Show>
                        </tbody>
                    </table>
                    {/* crear vacation */}
                    <Show condicion={option == options.CREATE}>
                        <CreateVacation config_vacation={config_vacation}
                            onClose={() => setOption("")}
                            onSave={onSave}
                        />
                    </Show>
                    {/* editar vacation */}
                    <Show condicion={option == options.EDIT}>
                        <EditVacation onClose={() => setOption("")}
                            config_vacation={config_vacation}
                            vacation={current_vacation}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                        />
                    </Show>
                </div>
            </div>
        </div>
    )
}

export default Vacation;