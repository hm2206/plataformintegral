import React, { useState, useContext, useEffect, Fragment } from 'react';
import Skeleton from 'react-loading-skeleton';
import { escalafon } from '../../services/apis';
import moment from 'moment'
import Show from '../show';

const Placeholder = () => {

    const datos = [1, 2, 3, 4];

    return <Fragment>
        <div className="col-md-12"></div>
        {datos.map((d, indexD) => 
            <div className="col-md-6 mb-3" key={`placeholder-contrato-${indexD}`}>
                <Skeleton height="50px"/>
                <Skeleton height="150px"/>
            </div>
        )}
    </Fragment>
}

const Ascenso = ({ work }) => {

    const [current_loading, setCurrentLoading] = useState(false);
    const [current_data, setCurrentData] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [error, setError] = useState(false);

    // obtener meritos
    const getDatos = async (add = false) => {
        setCurrentLoading(true);
        await escalafon.get(`work/${work.id}/familiar?page=${current_page}`)
            .then(res => {
                let { success, message, familiares } = res.data;
                if (!success) throw new Error(message);
                setError(false);
                setCurrentTotal(familiares.total);
                setCurrentLastPage(familiares.last_page);
                setCurrentData(add ? [...current_data, ...familiares.data] : familiares.data);
            })
            .catch(err => setError(true))
            setCurrentLoading(false);
    }

    // primera carga
    useEffect(() => {
        getDatos();
    }, []);

    // render
    return <div className="row">
        <div className="col-md-12">
            <h5>Listado de Familiares</h5>
            <hr/>
        </div>
        
        {current_data.map((d, indexD) => 
            <div className="col-md-6" key={`grado-lista-${indexD}`}>
                <div className="card">
                    <div className="card-header">
                        Apellidos y Nombres: <span className="uppercase">{d.person && d.person.fullname || ""}</span>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-10">
                                <div className="mb-2"><b>Fecha de Nacimiento: </b> {d.person && moment(d.person.date_of_birth).format('DD/MM/YYYY')}</div>
                                <div className="mb-2"><b>Tipo: </b> {d.type == 'CHILD' ? 'Hijo(a)' : 'Conyugue'}</div>
                                <div className="mb-2"><b>Descripción: </b> {d.descripcion}</div>
                            </div>
                            <div className="col-md-2 text-right">
                                <div className="btn-group">
                                    {/* <button className="btn btn-sm btn-primary">
                                        <i className="fas fa-edit"></i>
                                    </button> */}

                                    <Show condicion={d.file}>
                                        <a href={d.file} target="__blank" className="btn btn-sm btn-red">
                                            <i className="fas fa-file-pdf"></i>
                                        </a>
                                    </Show>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>    
        )}

        <Show condicion={current_loading}>
            <Placeholder/>
        </Show>
    </div>
}

// export 
export default Ascenso;