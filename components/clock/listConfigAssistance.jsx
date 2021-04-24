import React, { useEffect, useState, useContext } from 'react';
import { Form, Button } from 'semantic-ui-react';
import Skeleton from 'react-loading-skeleton';
import AssistanceProvider from '../../providers/clock/AssistanceProvider'
import { AssistanceContext } from '../../contexts/clock/AssistanceContext';
import { EntityContext } from '../../contexts/EntityContext';
import { assistanceTypes  } from '../../contexts/clock/AssistanceReducer';
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
    const [fecha, setFecha] = useState();
    const [current_loading, setCurrentLoading] = useState(false);
    const [is_error, setIsError] = useState(false); 

    // config
    const options = {
        headers: {
            EntityId: entity_id
        }
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

    useEffect(() => {
        let currentDate = moment().format('YYYY-MM-DD');
        setFecha(currentDate);
    }, []);

    useEffect(() => {
        if (entity_id) getAssistances();
    }, [entity_id]);

    return (
        <div className="card">
            <Form className="card-header">
                <div className="row">
                    <div className="col-12 mb-3">
                        <i className="fas fa-clock"></i> Fecha de búsqueda
                    </div>

                    <div className="col-6">
                        <input type="date"
                            value={fecha || ""}
                            readOnly
                        />
                    </div>

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