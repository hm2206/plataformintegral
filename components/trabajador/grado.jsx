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

const GradoIndex = ({ work }) => {

    const [current_loading, setCurrentLoading] = useState(false);
    const [current_grados, setCurrentGrados] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [error, setError] = useState(false);

    // obtener grados
    const getGrado = async (add = false) => {
        setCurrentLoading(true);
        await escalafon.get(`work/${work.id}/grado?page=${current_page}`)
            .then(res => {
                let { success, message, grados } = res.data;
                if (!success) throw new Error(message);
                setError(false);
                setCurrentTotal(grados.total);
                setCurrentLastPage(grados.last_page);
                setCurrentGrados(add ? [...current_grados.data, ...grados.data] : grados.data);
            })
            .catch(err => setError(true))
            setCurrentLoading(false);
    }

    // primera carga
    useEffect(() => {
        getGrado();
    }, []);

    // render
    return <div className="row">
        <div className="col-md-12">
            <h5>Listado de Formación Académica</h5>
            <hr/>
        </div>
        
        {current_grados.map((gra, indexG) => 
            <div className="col-md-6" key={`grado-lista-${indexG}`}>
                <div className="card">
                    <div className="card-header">
                        Institución: {gra.institution}
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-10">
                                <div className="mb-2"><b>Grado: </b> {gra.grado}</div>
                                <div className="mb-2"><b>N° regístro: </b> {gra.numero_de_registro}</div>
                                <div className="mb-2"><b>Descripción: </b> {gra.descripcion}</div>
                                <div className="mb-2"><b>Fecha de Titulo: </b> {moment(gra.fecha_de_titulo).format('DD/MM/YYYY')}</div>
                            </div>
                            <div className="col-md-2 text-right">
                                <div className="btn-group">
                                    {/* <button className="btn btn-sm btn-primary">
                                        <i className="fas fa-edit"></i>
                                    </button> */}

                                    <Show condicion={gra.file}>
                                        <a href={gra.file} target="__blank" className="btn btn-sm btn-red">
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
export default GradoIndex;