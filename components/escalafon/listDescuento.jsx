import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Form, Button, Select } from 'semantic-ui-react';
import Skeleton from 'react-loading-skeleton';
import ConfigAssistanceProvider from '../../providers/escalafon/ConfigAssistanceProvider'
import { AssistanceContext } from '../../contexts/escalafon/AssistanceContext';
import { EntityContext } from '../../contexts/EntityContext';
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

    const headers = () => {
        let payload = [];
        for (let index = 1; index < 30; index++) {
            payload.push(index);
        }
        return payload;
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
                    <table className="table-excel font-10">
                        <thead>
                            <tr>
                                <th className="text-center" rowSpan="2">N° <br/> TRAB</th>
                                <th className="text-center no-wrap" rowSpan="2">APELLIDOS  Y  NOMBRES</th>
                                <th className="text-center no-wrap" rowSpan="2">N° DOCUMENTO</th>
                                <th className="text-center no-wrap" width="50px" rowSpan="2">CAT. NIV.</th>
                                {headers().map(h => 
                                    <th className="text-center no-wrap" key={`item-header-${h}`}>{h}</th>
                                )}
                                <th className="text-center no-wrap" rowSpan="2">TOT <br /> MIN</th>
                                <th className="text-center no-wrap" rowSpan="2">(*) <br /> TOTAL <br /> DESC.</th>
                                <th className="text-center no-wrap" rowSpan="2">DCTO <br /> X <br /> MIN</th>
                                <th className="text-center no-wrap" rowSpan="2">BASE DE <br /> CALCULO</th>
                                <th className="text-center no-wrap" colSpan="13">OCURRENCIAS</th>
                            </tr>
                            <tr>
                                {headers().map(h => 
                                    <th className="text-center no-wrap" key={`item-header-${h}`}>{h}</th>
                                )}
                                <th>V</th>
                                <th>DM</th>
                                <th>F</th>
                                <th>LCG</th>
                                <th>CS</th>
                                <th>LCS</th>
                                <th>ONO</th>
                                <th>L</th>
                                <th>C</th>
                                <th>SJ</th>
                                <th>P</th>
                                <th>FR</th>
                                <th>L</th>
                            </tr>
                        </thead>
                    </table>
                    {/* info */}
                    <div className="row">
                        <div className="col-6">
                            <div className="table-responsive">
                                <table className="table-excel font-12">
                                    <thead>
                                        <tr>
                                            <th width="70%" className="text-center no-wrap">DONDE:</th>
                                            <th width="30%" className="text-center no-wrap">N° TRAB</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ListDescuento;