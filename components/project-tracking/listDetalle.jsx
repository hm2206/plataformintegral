import React, { useContext, useState, useEffect } from 'react';
import { Button, Form, Select } from 'semantic-ui-react';
import Modal from '../modal'
import Show from '../show';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { Confirm } from '../../services/utils';
import { projectTracking } from '../../services/apis';
import Swal from 'sweetalert2';
import currencyFormatter from 'currency-formatter';
import moment from 'moment';

const defaultData = {
    lastPage: 0,
    total: 0,
    page: 0,
    data: []
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

    // cambiar form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        let newErrors = Object.assign({}, errors);
        setErrors(newErrors);
    }

    // crear equipo
    const createDetalle = async () => {
        let answer = await Confirm("warning", `¿Estás seguro en guardar los datos?`);
        if (answer) {
            app_context.fireLoading(true);
            let datos = Object.assign({}, form);
            datos.gasto_id = gasto.id;
            await projectTracking.post(`detalle`, datos)
                .then(res => {
                    app_context.fireLoading(false);
                    let { success, message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    setForm({});
                    if (typeof props.onCreate == 'function') props.onCreate();
                }).catch(err => {
                    try {
                        app_context.fireLoading(false);
                        let { errors, message } = err.response.data;
                        if (!errors) throw new Error(message);
                        Swal.fire({ icon: 'warning', text: message });
                        setErrors(errors);
                    } catch (error) {
                        Swal.fire({ icon: 'error', text: error.message });
                    }
                });
        }
    }

    // primera carga
    useEffect(() => {
        if (isGasto) getDetalles();
    }, [isGasto]);

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-coins"></i> Detalle de Gasto Ejecutado</span>}
            {...props}
            md="7"
        >  
            <Form className="card-body">
                <div className="row">
                    <div className="col-md-12 mb-3">
                        <Form.Field>
                            <label htmlFor="">Partida Presupuestal</label>
                            <input type="text" 
                                className="uppercase"
                                readOnly 
                                value={`${gasto && gasto.presupuesto} - ${gasto && gasto.ext_pptto}`}
                            />
                        </Form.Field>
                    </div>
                    
                    <div className="col-md-12 mb-3">
                        <Form.Field>
                            <label htmlFor="">Rubro</label>
                            <input type="text" 
                                className="uppercase"
                                readOnly 
                                value={gasto && gasto.rubro}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field>
                            <label htmlFor="">Descripción de gasto programado</label>
                            <input type="text" 
                                className="uppercase"
                                readOnly 
                                value={`${gasto && gasto.description}`}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mb-3">
                        <Form.Field>
                            <label htmlFor="">Medida de gasto programado</label>
                            <input type="text" 
                                className="uppercase"
                                readOnly 
                                value={`${gasto && gasto.medida || ""}`}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Total de gasto programado</label>
                            <input type="text" 
                                className="uppercase"
                                readOnly 
                                value={`${gasto && currencyFormatter.format(gasto.total, { code: 'PEN' })}`}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-6 mb-3">
                        <Form.Field>
                            <label htmlFor="">Total de gasto ejecutado</label>
                            <input type="text" 
                                className="uppercase"
                                readOnly 
                                value={`${gasto && currencyFormatter.format(total, { code: 'PEN' })}`}
                            />
                        </Form.Field>
                    </div>

                    <div className="col-md-12 mt-4 mb-3">
                        <hr/>
                        <h5><i className="fas fa-info-circle"></i> Comprobantes</h5>
                        <hr/>
                    </div>

                    {detalle && detalle.data && detalle.data.map((det, indexD) => 
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
                </div>
            </Form>
        </Modal>
    )
}

export default ListDetalle;