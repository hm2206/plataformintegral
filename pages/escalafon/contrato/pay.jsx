import React, { Fragment, useEffect, useState, useContext } from 'react';
import { Form, Button, Select, Checkbox } from 'semantic-ui-react';
import { AUTHENTICATE } from '../../../services/auth';
import Router from 'next/router';
import { Body, BtnFloat, BtnBack } from '../../../components/Utils';
import { unujobs } from '../../../services/apis';
import Show from '../../../components/show';
import Swal from 'sweetalert2';
import { backUrl } from '../../../services/utils'
import atob from 'atob'
import ContentControl from '../../../components/contentControl';
import UpdateRemuneracion from '../../../components/contrato/updateRemuneracion';
import UpdateAportacion from '../../../components/contrato/updateAportacion';
import UpdateDescuento from '../../../components/contrato/updateDescuento';
import { AppContext } from '../../../contexts/AppContext';

// componente principal
const Pay = ({ success, info, query }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [edit, setEdit] = useState(false);
    const [send, setSend] = useState(false);

    // cancelar edición
    const cancelConfig = async () => {
        setEdit(false);
    }

    return (
    <Fragment>
        <div className="col-md-12">
            <Body>
                <div className="card-">
                    <div className="card-header">
                        <BtnBack 
                            onClick={(e) => Router.push({ pathname: backUrl(Router.pathname), query: { query_search: `${success ? info.person.fullname : ''}` }})} 
                        /> <span className="ml-4">Configuración del contrato</span>
                    </div>

                    <div className="card-body">
                        <Form>
                            <div className="row">
                                <div className="col-md-4 mt-3 text-center">
                                    <img src={info && info.person && info.person.image_images && info.person.image_images.image_200x200 || '/img/perfil.jpg'}
                                        style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%" }}
                                    />
                                            
                                    <div className="row">
                                        <div className="col-md-12 mt-3">
                                            <h3 className="text-center uppercase">{info && info.person ? info.person.fullname : ''}</h3>
                                        </div>

                                        <div className="col-md-12 mt-5 text-left">
                                            <label>Tip. Documento</label>
                                            <input type="text"
                                                disabled
                                                readOnly
                                                value={info && info.person && info.person.document_type || ""}
                                                disabled
                                            />
                                        </div>

                                        <div className="col-md-12 mt-3 text-left">
                                            <Form.Field>
                                                <label>N° Documento</label>
                                                <input type="text"
                                                    disabled
                                                    readOnly
                                                    value={info && info.person && info.person.document_number || ""}
                                                />
                                            </Form.Field>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-8">
                                    <div className="row">
                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Planilla</label>
                                                <input type="text" disabled defaultValue={info.planilla || ""}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Partición Presupuestal</label>
                                                <input type="text" disabled defaultValue={info.cargo || ""}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Ext. Presupuestal</label>
                                                <input type="text" disabled defaultValue={info.ext_pptto || ""}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">P.A.P</label>
                                                <input type="text" disabled defaultValue={info.pap}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Tip. Categoría</label>
                                                <input type="text" disabled defaultValue={info.categoria}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">MetaID</label>
                                                <input type="text" disabled defaultValue={info.meta}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">ActividadID</label>
                                                <input type="text" disabled defaultValue={info.actividadID}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Meta</label>
                                                <input type="text" disabled defaultValue={info.meta}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Dependencia</label>
                                                <input type="text" disabled defaultValue={info.dependencia && info.dependencia.nombre}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Perfil Laboral</label>
                                                <input type="text" disabled defaultValue={info.perfil_laboral && info.perfil_laboral.nombre || ""}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Situación Laboral</label>
                                                <input type="text" disabled defaultValue={info.situacion_laboral || ""}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">{info.is_pay ? 'Remunerada' : 'No Remunerada'}</label>
                                                <Checkbox toggle checked={info.is_pay ? true : false} readOnly disabled/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Plaza</label>
                                                <input type="text" disabled defaultValue={info.plaza}/>
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Fecha de Ingreso</label>
                                                <input type="date" 
                                                    disabled={true}
                                                    defaultValue={info.fecha_de_ingreso || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Fecha de Cese</label>
                                                <input type="date" 
                                                    disabled={true} 
                                                    defaultValue={info.fecha_de_cese || ""} 
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-8 mt-3">
                                            <Form.Field>
                                                <label htmlFor="">Observación</label>
                                                <textarea type="text" disabled defaultValue={info.observacion}/>
                                            </Form.Field>
                                        </div>

                                        <Show condicion={info.file}>
                                            <div className="col-md-4 mt-3">
                                                <Form.Field>
                                                    <label htmlFor="">File</label>
                                                    <Button color="red"
                                                        onClick={(e) => this.handleFile(info.file)}
                                                    >
                                                        <i className="fas fa-file-pdf"></i>
                                                    </Button>
                                                </Form.Field>
                                            </div>
                                        </Show>
                                    </div>
                                </div>

                                <div className="col-md-12">
                                    <hr/>
                                </div>
                            </div>
                        </Form>
                    </div>

                    <Show condicion={success}>
                        <div className="card-body" id="config">
                            <h4><i className="fas fa-cogs"></i> Configurar Remuneraciones</h4>
                            <UpdateRemuneracion info={info} edit={edit} send={send}/>
                            <hr/>

                            <h4><i className="fas fa-cogs"></i> Configurar Aporte Empleador</h4>
                            <UpdateAportacion info={info} edit={edit} send={send}/>
                            <hr/>
                            
                            <h4><i className="fas fa-cogs"></i> Configurar Descuentos</h4>
                            <UpdateDescuento info={info} edit={edit} send={send}/>
                        </div>
                    </Show>
                </div>
            </Body>
        </div>

        <Show condicion={success && info.estado}>
            <ContentControl>
                <Show condicion={edit}>
                    <div className="col-lg-2 col-6">
                        <Button fluid color="blue" onClick={(e) => setSend(true)}>
                            <i className="fas fa-sync"></i> Actualizar
                        </Button>
                    </div>

                    <div className="col-lg-2 col-6">
                        <Button fluid color="red"onClick={cancelConfig}>
                            <i className="fas fa-times"></i> Cancelar
                        </Button>
                    </div>
                </Show>

                <Show condicion={!edit}>
                    <div className="col-lg-2 col-6">
                        <Button fluid color="teal" onClick={(e) => setEdit(true)}>
                            <i className="fas fa-pencil-alt"></i> Editar
                        </Button>
                    </div>
                </Show>
            </ContentControl>
        </Show>
    </Fragment>)
}

// server rendering
Pay.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let id = atob(ctx.query.id || "");
    // request
    let { success, info } = await unujobs.get(`info/${id}`, {}, ctx)
    .then(res => res.data)
    .catch(err => ({ success: false }));
    // response
    return { success, info: info || {}, query: ctx.query };
}

export default Pay;