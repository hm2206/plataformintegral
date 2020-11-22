import React, { Fragment, useContext, useEffect, useState } from 'react';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';
import { unujobs } from '../../../services/apis';
import { backUrl, Confirm } from '../../../services/utils';
import Router from 'next/router';
import { Form, Checkbox, Button } from 'semantic-ui-react';
import atob from 'atob';
import { SelectTypeDescuentoPlanilla } from '../../../components/select/cronograma';
import { AppContext } from '../../../contexts/AppContext';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import Skeleton from 'react-loading-skeleton'

const PlaceholderConfig = () => {

    const array = [1, 2, 3, 4, 5, 6];

    return <Fragment>
        {array.map(a => 
            <div className="col-md-4 mb-3" key={`key-array-type-descuento-${a}`}>
                <div className="row">
                    <div className="col-md-10">
                        <Skeleton height="38px"/>
                    </div>
                    <div className="col-md-2">
                        <Skeleton height="38px"/>
                    </div>
                </div>
            </div>
        )}
    </Fragment>
}

const TypeDescuentoConfig = ({ query, pathname, type_descuento }) => {

    // app
    const app_context = useContext(AppContext);

    // estados
    const [form, setForm] = useState({});
    const [current_loading, setCurrentLoading] = useState(true);
    const [planilla, setPlanilla] = useState({ page: 1, total: 0, data: [], lastPage: 0  });
    const [reload, setReload] = useState("");

    // manejador del form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
    }

    // obtener planillas
    const getPlanillas = async (add = false) => {
        setCurrentLoading(true);
        let { page } = planilla;
        await unujobs.get(`type_descuento/${type_descuento.id}/planilla?page=${page}`)
            .then(res => {
                let { success, planillas, message } = res.data;
                if (!success) throw new Error(message);
                setPlanilla({
                    page: planillas.current_page,
                    lastPage: planillas.last_page,
                    total: planillas.total,
                    data: add ? [...planilla.data, ...planillas.data] : planillas.data
                });
            }).catch(err => console.log(err));
            setCurrentLoading(false);
    }

    // asignar planilla
    const assignPlanilla = async () => {
        let answer = await Confirm("warning", `Estas seguro en guardar los datos`);
        if (answer) {
            app_context.fireLoading(true);
            let datos = Object.assign({}, form);
            datos.type_descuento_id = type_descuento.id;
            await unujobs.post('planilla_type_descuento', datos)
                .then(({ data }) => {
                    app_context.fireLoading(false);
                    Swal.fire({ icon: 'success', text: data.message })
                    setReload(true);
                    getPlanillas();
                    setForm({});
                })
                .catch(err => {
                    app_context.fireLoading(false);
                    let { errors, message } = err.response.data;
                    if (typeof errors == 'object') Swal.fire({ icon: 'warning', text: message });
                    else Swal.fire({ icon: 'error', text: message });
                })
        }
    }

    // primera carga
    useEffect(() => {
        getPlanillas();
    }, []);

    // render
    return (
        <div className="col-md-12">
            <Body>
                <div className="card-header">
                    <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Configuración de Tipo Descuento
                </div>
                <div className="card-body">
                    <Form>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="">Clave</label>
                                <input type="text" 
                                    disabled 
                                    readOnly 
                                    value={type_descuento.key}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="">Descripción</label>
                                <input type="text" 
                                    disabled 
                                    readOnly 
                                    value={type_descuento.descripcion}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="">Edición</label>
                                <div>
                                    <Checkbox toggle checked={type_descuento.edit ? true : false} disabled/>
                                </div>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="">Reporte Plame</label>
                                <div>
                                    <Checkbox toggle checked={type_descuento.plame ? true : false} disabled/>
                                </div>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="">Judicial</label>
                                <div>
                                    <Checkbox toggle checked={type_descuento.judicial ? true : false} disabled/>
                                </div>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="">Estado</label>
                                <div>
                                    <Checkbox toggle checked={type_descuento.estado ? true : false} disabled/>
                                </div>
                            </div>

                            <div className="col-md-12 mb-4">
                                <hr/>
                                <h5><i className="fas fa-cogs"></i> Configuración Planilla</h5>
                                <hr/>   
                            </div>

                            <div className="col-md-9">
                                <SelectTypeDescuentoPlanilla
                                    name="planilla_id"
                                    value={form.planilla_id}
                                    except={1}
                                    type_descuento_id={type_descuento.id}
                                    onChange={(e, obj) => handleInput(obj)}
                                    refresh={reload}
                                    onReady={(e) => setReload(false)}
                                />
                            </div>

                            <div className="col-md-3">
                                <Button color="teal"
                                    disabled={!form.planilla_id}
                                    onClick={assignPlanilla}
                                >
                                    <i className="fas fa-save"></i> Guardar
                                </Button>
                            </div>

                            <div className="col-md-12 mb-4">
                                <hr/>
                            </div>

                            <div className="col-md-12">
                                <div className="row">
                                    {planilla.data.map((p, indexP) => 
                                        <div className="col-md-4 capitalize" key={`planilla_type_Descuento-${indexP}`}>
                                            <div className="card">
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-10">
                                                            {p.nombre}
                                                        </div>
                                                        <div className="col-md-2">
                                                            <Button color="red">
                                                                <i className="fas fa-trash"></i>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>    
                                    )}

                                    {/* loader */}
                                    <Show condicion={current_loading}>
                                        <PlaceholderConfig/>
                                    </Show>
                                </div>
                            </div>
                        </div>
                    </Form>
                </div>
            </Body>
        </div>
    )
}

// server rendering
TypeDescuentoConfig.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    let id = atob(query.id) || '_error';
    let { success, type_descuento } = await unujobs.get(`type_descuento/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false }));
    // response
    return { query, pathname, success, type_descuento };
}

export default TypeDescuentoConfig;