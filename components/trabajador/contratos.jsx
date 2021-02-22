import React, { useState, useContext, useEffect, Fragment } from 'react';
import Skeleton from 'react-loading-skeleton';
import Show from '../show'
import { escalafon } from '../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';

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

const Contratos = ({ work }) => {

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_infos, setCurrentInfos] = useState([]);
    const [page, setPage] = useState(1);
    const [current_total, setCurrenTotal] = useState(0);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [error, setError] = useState(false);

    // primera carga
    useEffect(() => {
        getInfos();
    }, []);

    // obtener contratos
    const getInfos = async (add = false) => {
        setCurrentLoading(true);
        await escalafon.get(`work/${work.id}/info`)
            .then(res => {
                let { success, infos, message } = res.data;
                if (!success) throw new Error(message);
                setCurrentInfos(add ? [...current_infos, ...infos.data] : infos.data);
                setCurrenTotal(infos.total || 0);
                setPage(infos.current_page || 1);
                setCurrentLastPage(infos.last_pate || 0);
            }).catch(err => setError(true))
        setCurrentLoading(false);
    }

    // redirigir a editar
    const handleEdit = (obj) => {
        let path = `/escalafon/contrato/edit`;
        let q = {};
        q.id = btoa(obj.id);
        q.href = btoa(Router.asPath);
        Router.push({ pathname: path, query: q });
    }

    // render
    return <div className="row">
        <div className="col-md-12">
            <h5>Listado de Contratos y/o Nombramientos</h5>
            <hr/>
        </div>
        
        {current_infos.map((i, indexI) => 
            <div className="col-md-6" key={`info-list-${i.id}-${indexI}`}>
                <div className={`card font-13 ${i.estado ? 'alert-success' : ''}`}>
                    <div className="card-header">
                        Planilla: {i.planilla && i.planilla.nombre || ""}
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-10">
                                <div><b>Tip. Categoría:</b> {i.type_categoria && i.type_categoria.descripcion}</div>
                                <div><b>Fecha de Resolución:</b> {i.fecha_de_resolucion}</div>
                                <div><b>Resolución:</b> {i.resolucion}</div>
                                <div><b>Fecha de Ingreso:</b> {i.fecha_de_ingreso}</div>
                                <div><b>Fecha de Cese:</b> {i.fecha_de_cese}</div>
                                <div><b>Plaza:</b> {i.plaza}</div>
                                <div><b>P.A.P:</b> {i.pap}</div>
                            </div>
                            <div className="col-md-2 text-right">
                                <div className="btn-group">
                                    <button className="btn btn-sm btn-outline-primary"
                                        onClick={(e) => handleEdit(i)}
                                    >
                                        <i className="fas fa-search"></i>
                                    </button>

                                    <button className="btn btn-sm btn-outline-red">
                                        <i className="fas fa-file-pdf"></i>
                                    </button>
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
export default Contratos;