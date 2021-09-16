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
import { AppContext } from '../../contexts';
import { Confirm } from '../../services/utils';
import Visualizador from '../visualizador';
import Swal from 'sweetalert2';
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
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>
    );
}

const assistanceProvider = new AssistanceProvider();

const ListAssistance = () => {

    // app
    const app_context = useContext(AppContext);

    // entity
    const { entity_id } = useContext(EntityContext);

    // assistance
    const { assistances, dispatch, year, setYear, month, setMonth, day, setDay, query_search, setQuerySearch, option, setOption } = useContext(AssistanceContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_refresh, setIsRefresh] = useState(false);
    const [is_error, setIsError] = useState(false); 
    const [current_file, setCurrentFile] = useState(null);

    // memos
    const isFilter = useMemo(() => {
        return year && month
    }, [year, month]);

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
        let payload = [{ key: 'all', value: '', text: 'Todos' }];
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
        await assistanceProvider.index({ page: assistances.page, year, month, day, query_search }, options)
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

    const generateReportPDF = async () => {
        let answer = await Confirm("info", `¿Estás seguro en generar el reporte en PDF?`, 'Generar PDF');
        if (!answer) return setOption("");
        app_context.setCurrentLoading(true);
        await assistanceProvider.reportMonthly({ year, month, day, query_search })
        .then(res => {
            app_context.setCurrentLoading(false);
            let file = new File([res.data], 'report-pdf.pdf');
            file.url = URL.createObjectURL(res.data);
            file.extname = 'pdf';
            setCurrentFile(file);
            setOption('VISUALIZADOR')
        }).catch(err => {
            setOption("");
            app_context.setCurrentLoading(false);
            Swal.fire({ icon: 'error', text: 'No se pudó generar el PDF' })
        });
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

    const handleOption = () => {
        switch(option) {
            case 'REPORT-PDF':
                generateReportPDF();
                break;
        }
    }

    useEffect(() => {
        let currentDate = moment();
        setYear(currentDate.year());
        setMonth(currentDate.format('MM'));
        setDay(currentDate.format('DD'));
    }, []);

    useEffect(() => {
        handleSearch();
    }, [day, month]);

    useEffect(() => {
        if (entity_id && is_refresh) getAssistances();
    }, [is_refresh]);

    useEffect(() => {
        if (is_refresh) setIsRefresh(false);
    }, [is_refresh]);

    useEffect(() => {
        if (assistances.page > 1) getAssistances(true);
    }, [assistances.page]);

    useEffect(() => {
        if (option) handleOption();
    }, [option]);

    return (
        <div className="card">
            <Form className="card-header">
                <div className="row">
                    <div className="col-12 mb-3">
                        <i className="fas fa-clock"></i> Fecha de Búsqueda
                    </div>

                    <div className="col-md-4 col-6 mb-2">
                        <input type="text"
                            placeholder="Buscar por Apellidos y Nombres"
                            onChange={({ target }) => setQuerySearch(target.value)}
                            value={query_search || ""}
                        />
                    </div>

                    <div className="col-md-2 col-6 mb-2">
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
                        <div className="col-md-2 col-6">
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

                <div className="table-responsive" style={{  minHeight: '80vh' }}>
                    <table className="table table-bordered table-stripe">
                        <thead>
                            <tr>
                                <th width="7%" className="text-center">ID#</th>
                                <th>Apellidos y Nombres</th>
                                <th width="15%" className="text-center">Fecha</th>
                                <th width="15%" className="text-center">Tiempo marcado</th>
                                <th width="10%" className="text-center">Tipo</th>
                                <th width="15%" className="text-center">Descripción</th>
                                <th width="10%" className="text-center">Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* listar datos */}
                            {assistances?.data?.map((a, indexA) => 
                                <ItemAssistance assistance={a}
                                    index={indexA}
                                    group={a.person_id != assistances?.data?.[indexA + 1]?.person_id ? true : false}
                                    key={`list-assistance-table-${indexA}`}
                                />
                            )}
                            {/* preloader */}
                            <Show condicion={!current_loading}
                                predeterminado={<PlaceholderTable/>}
                            >
                                <Show condicion={!assistances.total}>
                                    <tr>
                                        <td colSpan="7" className="text-center">No hay regístros disponibles</td>
                                    </tr>
                                </Show>
                            </Show>
                            {/* obtener más regíster */}
                            <Show condicion={(assistances?.last_page >= assistances?.page + 1)}>
                                <tr>
                                    <th colSpan="7">
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
            {/* visualizador */}
            <Show condicion={option == 'VISUALIZADOR'}>
                <Visualizador
                    onClose={() => setOption("")}
                    id="vizualizador-report-pdf"
                    is_print={true}
                    is_observation={false}
                    name={current_file?.name}
                    extname={current_file?.extname}
                    url={current_file?.url}
                />
            </Show>
        </div>
    );
}

export default ListAssistance;