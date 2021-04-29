import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import Skeleton from 'react-loading-skeleton';
import AssistanceProvider from '../../providers/clock/AssistanceProvider'
import { AssistanceContext } from '../../contexts/clock/AssistanceContext';
import { EntityContext } from '../../contexts/EntityContext';
import { assistanceTypes  } from '../../contexts/clock/AssistanceReducer';
import ItemAssistance from './itemAssistance';
import { SelectConfigAssistance } from '../select/clock';
import Show from '../show';
import moment from 'moment';
import uid from 'uid';
import { collect } from 'collect.js';
moment.locale('es');

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

const assistanceProvider = new AssistanceProvider();

const ListAssistance = () => {

    // entity
    const { entity_id } = useContext(EntityContext);

    // assistance
    const { assistances, dispatch } = useContext(AssistanceContext);

    // estados
    const [year, setYear] = useState();
    const [month, setMonth] = useState();
    const [config_assistance_id, setConfigAssistanceId] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_error, setIsError] = useState(false); 

    // memos
    const isChangeFilter = useMemo(() => {
        return uid(6);
    }, [year, month]);

    // config
    const options = {
        headers: { EntityId: entity_id }
    }

    const getAssistances = async () => {
        setCurrentLoading(true);
        await assistanceProvider.index({ page: assistances.page }, options)
        .then(res => {
            let { assistances } = res.data;
            let payload = {
                page: assistances.page,
                last_page: assistances.lastPage,
                total: assistances.total,
                data: assistances.data
            }
            console.log(payload);
            // set datos
            dispatch({ type: assistanceTypes.SET_ASSISTANCES, payload });
            setIsError(false);
        }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    const handleDefaultDate = async (options = []) => {
        let pluckedText = await collect(options).pluck('text').toArray();
        let current_date = moment().format('YYYY-MM-DD');
        let index = pluckedText.indexOf(current_date);
        if (index >= 0) {
            let current_config = options[index];
            setConfigAssistanceId(current_config.value);
        } else setConfigAssistanceId("");
    }

    useEffect(() => {
        let currentDate = moment();
        setYear(currentDate.year());
        setMonth(currentDate.month() + 1);
    }, []);

    useEffect(() => {
        if (entity_id) getAssistances();
    }, [entity_id]);

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
                            onChange={({ target }) => setYear(target.value)}
                            value={year || ""}
                        />
                    </div>

                    <div className="col-6 col-md-2 mb-2">
                        <Select
                            placeholder="Seleccionar Mes"
                            value={month || ""}
                            onChange={(e, obj) => setMonth(obj.value)}
                            options={[
                                { key: "Ene", value: 1, text: "Enero" },
                                { key: "Feb", value: 2, text: "Febrero" },
                                { key: "Mar", value: 3, text: "Marzo" },
                                { key: "Abr", value: 4, text: "Abril" },
                                { key: "May", value: 5, text: "Mayo" },
                                { key: "Jun", value: 6, text: "Junio" },
                                { key: "Jul", value: 7, text: "Julio" },
                                { key: "Ago", value: 8, text: "Agosto" },
                                { key: "Sep", value: 9, text: "Septiembre" },
                                { key: "Oct", value: 10, text: "Octubre" },
                                { key: "Nov", value: 11, text: "Noviembre" },
                                { key: "Dic", value: 12, text: "Diciembre" }
                            ]}
                        />
                    </div>

                    <Show condicion={year && month}>
                        <div className="col-md-3">
                            <SelectConfigAssistance
                                name="config_assistance_id"
                                year={year || ""}
                                month={month || ""}
                                value={config_assistance_id}
                                onChange={(e, obj) => setConfigAssistanceId(obj.value)}
                                refresh={isChangeFilter}
                                onReady={handleDefaultDate}
                            />
                        </div>
                    </Show>

                    <div className="col-2">
                        <Button color="blue">
                            <i className="fas fa-search"></i>
                        </Button>
                    </div>
                </div>
            </Form>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-bordered table-stripe">
                        <thead>
                            <tr>
                                <th width="7%" className="text-center">ID#</th>
                                <th>Apellidos y Nombres</th>
                                <th width="15%" className="text-center">Tiempo marcado</th>
                                <th width="10%" className="text-center">Tipo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Show condicion={!current_loading}
                                predeterminado={<PlaceholderTable/>}
                            >
                                <Show condicion={assistances.total || false}
                                    predeterminado={
                                        <tr>
                                            <td colSpan="4" className="text-center">No hay regístros disponibles</td>
                                        </tr>
                                    }
                                >
                                    {assistances?.data?.map((a, indexA) => 
                                        <ItemAssistance assistance={a}
                                            key={`list-assistance-table-${indexA}`}
                                        />
                                    )}
                                </Show>
                            </Show>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ListAssistance;