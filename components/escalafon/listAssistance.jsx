import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import Skeleton from 'react-loading-skeleton';
import AssistanceProvider from '../../providers/escalafon/AssistanceProvider'
import { AssistanceContext } from '../../contexts/escalafon/AssistanceContext';
import { EntityContext } from '../../contexts/EntityContext';
import { assistanceTypes } from '../../contexts/escalafon/AssistanceReducer';
import ItemAssistance from './itemAssistance';
import Show from '../show';
import moment from 'moment';
moment.locale('es');

const PlaceholderTable = () => {
    const datos = [1, 2, 3, 4];
    return datos.map(index => 
        <tr key={`list-table-clock-${index}`}>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>
    );
}

const assistanceProvider = new AssistanceProvider();

const ListAssistance = () => {

    // entity
    const { entity_id } = useContext(EntityContext);

    // assistance
    const { assistances, dispatch, config_assistance_id } = useContext(AssistanceContext);

    // estados
    const [year, setYear] = useState();
    const [month, setMonth] = useState();
    const [day, setDay] = useState();
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_refresh, setIsRefresh] = useState(false);
    const [is_error, setIsError] = useState(false); 

    // memos
    const isFilter = useMemo(() => {
        return year && month && day
    }, [year, month, day]);

    const array_months = useMemo(() => {
        let payload = [];
        for (let index = 1; index <= 12; index++) {
            let current_date = moment(`2020-${index}-01`);
            payload.push({
                key: `month-${index}`,
                value: current_date.format('MM'),
                text: current_date.format("MMMM")
            })
        }
        // response months
        return payload;
    }, []);

    const array_days = useMemo(() => {
        let last_day = parseInt(moment(`${year}-${month}-01`).add(1, "month").subtract(1, "day").format('D'));
        let payload = [];
        for (let index = 1; index <= last_day; index++) {
            let text = moment(`${year}-${month}-${index}`).format('DD');
            payload.push({
                key: `day-${index}`,
                value: text,
                text
            })
        }
        // response days
        return payload;
    }, [year, month]);

    // config
    const options = {
        headers: { EntityId: entity_id }
    }

    const getAssistances = async (add = false) => {
        setCurrentLoading(true);
        let date = `${year}-${month}-${day}`
        await assistanceProvider.index({ page: assistances.page, date }, options)
        .then(res => {
            let { assistances } = res.data;
            let payload = {
                page: assistances.page,
                last_page: assistances.lastPage,
                total: assistances.total,
                data: assistances.data
            }
            // set datos
            dispatch({ 
                type: add ? assistanceTypes.PUSH_ASSISTANCES : assistanceTypes.SET_ASSISTANCES, 
                payload 
            });
            setIsError(false);
        }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    const handleSearch = async () => {
        let payload = { page: 1, last_page: 0, total: 0, data: [] };
        dispatch({ type: assistanceTypes.SET_ASSISTANCES, payload });
        setIsRefresh(true);
    }

    const nextPage = async () => {
        dispatch({ 
            type: assistanceTypes.SET_ASSISTANCES, 
            payload: { page: assistances.page + 1 } 
        });
    }

    useEffect(() => {
        let currentDate = moment();
        setYear(currentDate.year());
        setMonth(currentDate.format('MM'));
        setDay(currentDate.format('DD'));
    }, []);

    useEffect(() => {
        if (day) handleSearch();
        else dispatch({ type: assistanceTypes.SET_ASSISTANCES, payload: { page: 1, last_page: 0, total: 0, data: [] } });
    }, [day]);

    useEffect(() => {
        if (entity_id && is_refresh) getAssistances();
    }, [is_refresh]);

    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh]);

    useEffect(() => {
        if (assistances.page > 1) getAssistances(true);
    }, [assistances.page]);

    return (
        <div className="card">
            <Form className="card-header">
                <div className="row">
                    <div className="col-12 mb-3">
                        <i className="fas fa-clock"></i> Fecha de Búsqueda
                    </div>

                    <div className="col-md-3 col-6 mb-2">
                        <input type="number"
                            step="any"
                            placeholder="Año"
                            onChange={({ target }) => {
                                setYear(target.value)
                                setMonth("")
                            }}
                            value={year || ""}
                        />
                    </div>

                    <div className="col-6 col-md-2 mb-2">
                        <Select
                            placeholder="Seleccionar Mes"
                            value={month || ""}
                            onChange={(e, obj) => {
                                setMonth(obj.value)
                                setDay("")
                            }}
                            options={array_months}
                            className="capitalize"
                        />
                    </div>

                    <Show condicion={year && month}>
                        <div className="col-md-3">
                            <Select
                                placeholder="Seleccionar Día"
                                value={day || ""}
                                onChange={(e, obj) => setDay(obj.value)}
                                options={array_days}
                                className="capitalize"
                            />
                        </div>
                    </Show>

                    <div className="col-2">
                        <Button color="blue"
                            disabled={!isFilter || current_loading}
                            onClick={handleSearch}
                        >
                            <i className="fas fa-search"></i>
                        </Button>
                    </div>
                </div>
            </Form>
            <div className="card-body">
                
                <h4>Resultados: {assistances?.data?.length} de {assistances.total || 0}</h4>

                <div className="table-responsive">
                    <table className="table table-bordered table-stripe">
                        <thead>
                            <tr>
                                <th width="7%" className="text-center">ID#</th>
                                <th>Apellidos y Nombres</th>
                                <th width="15%" className="text-center">Tiempo marcado</th>
                                <th width="10%" className="text-center">Tipo</th>
                                <th width="10%" className="text-center">Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* listar datos */}
                            {assistances?.data?.map((a, indexA) => 
                                <ItemAssistance assistance={a}
                                    index={indexA}
                                    group={a.schedule_id != assistances?.data?.[indexA + 1]?.schedule_id ? true : false}
                                    key={`list-assistance-table-${indexA}`}
                                />
                            )}
                            {/* preloader */}
                            <Show condicion={!current_loading}
                                predeterminado={<PlaceholderTable/>}
                            >
                                <Show condicion={!assistances.total}>
                                    <tr>
                                        <td colSpan="5" className="text-center">No hay regístros disponibles</td>
                                    </tr>
                                </Show>
                            </Show>
                            {/* obtener más regíster */}
                            <Show condicion={(assistances?.last_page >= assistances?.page + 1)}>
                                <tr>
                                    <th colSpan="5">
                                        <Button fluid 
                                            disabled={current_loading}
                                            onClick={nextPage}
                                        >
                                            <i className="fas fa-arrow-down"></i> Obtener más regístros
                                        </Button>
                                    </th>
                                </tr>
                            </Show>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ListAssistance;