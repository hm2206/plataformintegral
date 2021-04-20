import React, { useEffect, useState } from 'react';
import { Form, Button } from 'semantic-ui-react';
import Skeleton from 'react-loading-skeleton';
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

const ListAssistance = () => {

    // estados
    const [fecha, setFecha] = useState();
    const [current_loading, setCurrentLoading] = useState(false);

    useEffect(() => {
        let currentDate = moment().format('YYYY-MM-DD');
        setFecha(currentDate);
    }, []);

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
                                <tr>
                                    <td colSpan="4" className="text-center">No hay regístros disponibles</td>
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