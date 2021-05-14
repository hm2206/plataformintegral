import React, { useContext, useState, useEffect } from 'react';
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { projectTracking } from '../../services/apis';
import currencyFormatter from 'currency-formatter';
import Skeleton from 'react-loading-skeleton';
import moment from 'moment';

const defaultData = {
    lastPage: 0,
    total: 0,
    page: 0,
    data: []
}

const Placeholder = () => {
    const data = [1, 2, 3, 4];
    return data.map( d => 
        <div key={`list-item-placeholder-${d}`}
            className="col-12"
        >
            <Skeleton height="50px"/>
        </div>
    )
}

const ListDetalle = (props) => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project } = useContext(ProjectContext);

    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [detalle, setDetalle] = useState(defaultData);
    const [current_loading, setCurrentLoading] = useState(false);
    const [total, setTotal] = useState(0);

    // props
    const { gasto } = props;
    const isGasto = Object.keys(gasto || {}).length;

    const getDetalles = async (nextPage = 1, up = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`gasto/${gasto.id}/detalle?page=${nextPage}`)
            .then(res => {
                let { success, message, detalles, total_ejecutado } = res.data;
                if (!success) throw new Error(message);
                // setting total
                setTotal(total_ejecutado)
                // setting detalle
                setDetalle({
                    page: detalles.page,
                    lastPage: detalles.lastPage,
                    total: detalles.total,
                    data: up ? [...detalle.data, ...detalles.data] : detalles.data
                });
            }).catch(err => console.log(err.message));
        setCurrentLoading(false);
    }

    // primera carga
    useEffect(() => {
        if (isGasto) getDetalles();
    }, [isGasto]);

    // render
    return (
        <div className="card-body">
            <div className="row">
                <Show condicion={!current_loading}
                    predeterminado={<Placeholder/>}
                >
                    {detalle?.data?.map((det, indexD) => 
                        <div className="col-md-12 mb-3" key={`show-comprobando-${indexD}`}>
                            <div className="card card-body">
                                <div className="row">
                                    <div className="col-md-10">
                                        <div>
                                            <b>Tip. Documento: </b> {det.document_type && det.document_type.name || ""}
                                        </div>
                                        
                                        <div>
                                            <b>N° Documento: </b> {det.document_number}
                                        </div>
                                        
                                        <div>
                                            <b>Beneficiario: </b> {det.razon_social}
                                        </div>

                                        <div>
                                            <b>RUC: </b> {det.ruc}
                                        </div>

                                        <div>
                                            <b>Fecha: </b> {moment(det.date).format('DD/MM/YYYY')}
                                        </div>

                                        <div>
                                            <b>Medio de pago: </b> {det.medio_pago && det.medio_pago.name || ""}
                                        </div>

                                        <Show condicion={det.pago_number}>
                                            <div>
                                                <b>N° Pago: </b> {det.pago_number}
                                            </div>
                                        </Show>

                                        <Show condicion={det.date_pago}>
                                            <div>
                                                <b>Fecha pago: </b> {moment(det.date_pago).format('DD/MM/YYYY')}
                                            </div>
                                        </Show>

                                        <div>
                                            <b>Monto: </b> {currencyFormatter.format(det.monto, { code: 'PEN' })}
                                        </div>

                                        <div>
                                            <b>Descripción: </b> {det.description}
                                        </div>
                                    </div>
                                    <div className="col-md-2 text-right">
                                        <div className="btn-group">
                                            <a className="btn btn-sm btn-outline-red"
                                                href={det.file && det.file.url || ""}
                                                target="_blank"
                                            >
                                                <i className="fas fa-file-pdf"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>    
                    )}
                    {/* no hay resgistros */}
                    <Show condicion={!detalle?.total}>
                        <div className="col-12 text-center">
                            No hay regístros
                        </div>
                    </Show>
                </Show>
            </div>
        </div>
    )
}

export default ListDetalle;