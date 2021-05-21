import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import Skeleton from 'react-loading-skeleton';
import ConfigAssistanceProvider from '../../providers/escalafon/ConfigAssistanceProvider'
import { AssistanceContext } from '../../contexts/escalafon/AssistanceContext';
import { EntityContext } from '../../contexts/EntityContext';
import { assistanceTypes } from '../../contexts/escalafon/AssistanceReducer';
import ItemAssistance from './itemAssistance';
import { SelectConfigAssistance } from '../select/escalafon';
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

const configAssistanceProvider = new ConfigAssistanceProvider();

const ListDescuento = () => {

    // entity
    const { entity_id } = useContext(EntityContext);

    // assistance
    const { assistances, dispatch, config_assistance_id } = useContext(AssistanceContext);

    // estados
    const [year, setYear] = useState();
    const [month, setMonth] = useState();
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
                                <th width="20%">Apellidos y Nombres</th>
                                <th width="10%" className="text-center">N° Documento</th>
                                <th width="3%" className="text-center">1</th>
                                <th width="3%" className="text-center">2</th>
                                <th width="3%" className="text-center">3</th>
                                <th width="3%" className="text-center">4</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ListDescuento;