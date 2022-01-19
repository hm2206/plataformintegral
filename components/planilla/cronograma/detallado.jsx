import React, { useContext, useEffect, useState, Fragment } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Select, Icon, Grid } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../contexts/AppContext';
import { SelectTypeDetalle } from '../select/cronograma';
import { Confirm } from '../../services/utils';

const PlaceHolderButton = ({ count = 1, height = "38px" }) => <Skeleton height={height} count={count}/>

const PlaceholderDetallado = () => (
    <Fragment>
        <div className="col-md-6 col-12 mt-3">
            <PlaceHolderButton/>
            <hr/>
            <div className="row mb-3 mt-3">
                <div className="col-md-9">
                    <PlaceHolderButton/>
                </div>
                <div className="col-md-3">
                    <PlaceHolderButton/>
                </div>
            </div>
            <PlaceHolderButton height="100px"/>
        </div>

        <div className="col-md-6 col-12 mt-3">
            <PlaceHolderButton/>
            <hr/>
            <div className="row mb-3 mt-3">
                <div className="col-md-9">
                    <PlaceHolderButton/>
                </div>
                <div className="col-md-3">
                    <PlaceHolderButton/>
                </div>
            </div>
            <PlaceHolderButton height="100px"/>
        </div>
    </Fragment>
);

const Detalle = () => {

    // cronograma
    const { edit, setEdit, loading, send, historial, setBlock, setSend, cronograma, setIsEditable, setIsUpdatable } = useContext(CronogramaContext);
    const [current_loading, setCurrentLoading] = useState(true);
    const [detalles, setDetalles] = useState([]);
    const [old, setOld] = useState([]);
    const [error, setError] = useState(false);
    const [form, setForm] = useState({});
    const [payload, setPayload] = useState([]);

    // app
    const app_context = useContext(AppContext);

    // obtener descuentos detallados
    const findDetallado = async () => {
        setBlock(true);
        setError(false);
        setCurrentLoading(true);
        await unujobs.get(`historial/${historial.id}/detalle`)
            .then(async res => {
                let { data } = res;
                let { success, message } = data;
                if (!success) throw new Error(message);
                await setDetalles(await data.detalles);
                setOld(JSON.parse(JSON.stringify(data.detalles)));
                setBlock(false);
            })
            .catch(err => {
                setDetalles([]);
                setOld([]);
                setError(true);
                setBlock(false);
            });
        setCurrentLoading(false);
    }

    // primera carga
    useEffect(() => {
        setIsEditable(true);
        setIsUpdatable(true);
        if (historial.id) findDetallado();
        return () => {}
    }, [historial.id]);

    // cancelar edit
    useEffect(() => {
        if (!edit && !send) setDetalles(JSON.parse(JSON.stringify(old)));
    }, [!edit]);

    // cambios en el form
    const handleInput = ({ name, value }) => {
        let newForm = Object.assign({}, JSON.parse(JSON.stringify(form)));
        newForm[name] = value;
        setForm(newForm);
    }

    // crear nuevo detalle
    const createDetalle = async () => {
        let answer = await Confirm("warning", `¿Deseas guardar el detalle?`, 'Guardar');
        if (answer) {
            app_context.setCurrentLoading(true);
            setBlock(true);
            // setting payload
            let payload = {
                historial_id: historial.id,
                type_detalle_id: form.type_detalle_id || "",
                monto: form.monto || ""
            };
            // request
            await unujobs.post('detalle', payload)
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                setForm({});
                setEdit(false);
                await findDetallado();
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message });
            });
            setBlock(false);
        }
    }

    // cambio de descuentos detallados
    const handleMonto = async ({ name, value }, parent, detalle, index) => {
        let newDetalles = await JSON.parse(JSON.stringify(detalles));
        let newPayload = Object.assign({}, JSON.parse(JSON.stringify(payload)));
        detalle[name] = value;
        detalle.edit = true;
        newDetalles[parent].detalles[index] = detalle;
        newPayload[index] = {
            id: detalle.id,
            monto: detalle.monto,
            descripcion: detalle.descripcion
        };
        await setDetalles(newDetalles);
        await setPayload(newPayload);
    }

    // actualizar detalle
    const updateDetalle = async () => {
        app_context.setCurrentLoading(true);
        setBlock(true);
        let form = new FormData;
        form.append('detalles', JSON.stringify(payload));
        await unujobs.post(`detalle/${historial.id}/all`, form, { headers: { CronogramaID: historial.cronograma_id } })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message } = res.data;
            if(!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            setEdit(false);
            setBlock(false);
            setSend(false);
            setOld(JSON.parse(JSON.stringify(detalles)));
        }).catch(err => {
            app_context.setCurrentLoading(false);
            setBlock(false);
            setSend(false);
            Swal.fire({ icon: 'error', text: err.message })
        });
    }

    // eliminar descuento detallado
    const deleteDetalle = async (id, parent, index) => {
        let answer = await Confirm("warning", `¿Deseas eliminar el descuento detallado?`)
        if (answer) {
            setCurrentLoading(true);
            setBlock(true);
            await unujobs.post(`detalle/${id}`, { _method: 'DELETE' })
            .then(async res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message })
                let newDetalles = JSON.parse(JSON.stringify(detalles));
                newDetalles[parent].detalles.splice(index, 1);
                setDetalles(newDetalles);
                setOld(JSON.parse(JSON.stringify(newDetalles)));
            }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
            setCurrentLoading(false);
            setBlock(false);
            setSend(false);
        }
    }

    // update detalles
    useEffect(() => {
        if (send) updateDetalle();
    }, [send]);
    
    return (
    <Form className="row">
        <div className="col-md-12">
            <div className="row">
                <div className="col-md-4 mb-1 col-12 col-sm-12 col-lg-4">
                    <SelectTypeDetalle
                        disabled={loading || current_loading || !edit}
                        name="type_detalle_id"
                        value={form.type_detalle_id || ""}
                        onChange={(e, obj) => handleInput(obj)}
                    />
                </div>

                <div className="col-md-4 mb-1 col-10 col-lg-3 col-sm-9">
                    <Show condicion={!loading && !current_loading}
                        predeterminado={<PlaceHolderButton/>}
                    >
                        <Form.Field>
                            <input type="number"
                                name="monto"
                                step="any"
                                value={form.monto || ""}
                                placeholder="Ingrese un monto"
                                disabled={!edit}
                                onChange={({target}) => handleInput(target)}
                            />
                        </Form.Field>
                    </Show>
                </div>

                <div className="col-xs col-md-4 col-2 col-sm-3 col-lg-3">
                    <Show condicion={!loading && !current_loading}
                        predeterminado={<PlaceHolderButton/>}
                    >
                        <Button color="green"
                            disabled={!form.type_detalle_id || !edit}
                            onClick={createDetalle}    
                            fluid
                        >
                            <i className="fas fa-plus"></i>
                        </Button>
                    </Show>
                </div>
            </div>
        </div>
                
        <div className="col-md-12">
            <hr/>
        </div>

        <div className="col-md-12">
            <Grid columns={2} fluid="true">
                <Show condicion={!loading && !current_loading}
                    predeterminado={<PlaceholderDetallado/>}
                >
                    {detalles.map((det, parent) => 
                        <Show key={`type_detalle_${det.id}`} 
                            condicion={det.detalles && det.detalles.length}
                        >
                            <Grid.Column>
                                <b><span className="text-red mb-2">{det.key}</span>.- <span className="text-primary">{det.descripcion}</span></b>
                                <hr/>
                                {det.detalles.map((detalle, index) => 
                                    <Fragment>
                                        <Form.Field key={`detalle-${detalle.id}`}>
                                            <label htmlFor="">{detalle.type_detalle && detalle.type_detalle.descripcion}</label>
                                            <div className="row">
                                                <div className="col-md-10">
                                                    <input type="number" 
                                                        name="monto"
                                                        step="any"
                                                        value={detalle.monto || ""}
                                                        disabled={!edit}
                                                        onChange={({target}) => handleMonto(target, parent, detalle, index)}
                                                        min="0"
                                                    />
                                                </div>
                                                        
                                                <div className="col-md-2">
                                                    <Button
                                                        fluid={true}
                                                        color="red"
                                                        disabled={!edit}
                                                        onClick={(e) => deleteDetalle(detalle.id, index)}
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </Button>
                                                </div>
                                            </div>
                                        </Form.Field>   

                                        <Form.Field>
                                            <textarea 
                                                disabled={!edit}
                                                name="descripcion"    
                                                onChange={({ target }) => handleMonto(target, parent, detalle, index)}
                                                value={detalle.descripcion || ""}
                                            />
                                        </Form.Field>
                                    </Fragment> 
                                )}
                            </Grid.Column>    
                        </Show>
                    )}
                </Show>
            </Grid>
        </div>
    </Form>)
}


export default Detalle;