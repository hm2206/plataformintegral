import React, { Fragment, useState, useContext, useEffect } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Select, Icon, Checkbox } from 'semantic-ui-react';
import Show from '../show';
import storage from '../../services/storage.json';
import Swal from 'sweetalert2';
import {  Confirm } from '../../services/utils';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../contexts/cronograma/CronogramaContext';
import { AppContext } from '../../contexts/AppContext';
import AddObligacion from './addObligacion';

const PlaceHolderButton = ({ count = 1, height = "38px" }) => <Skeleton height={height} count={count}/>

const PlaceholderObligaciones = () => (
    <Fragment>
        <div className="col-md-2 col-6 mb-3">
            <PlaceHolderButton/>
        </div>

        <div className="col-md-2 col-6 mb-3">
            <PlaceHolderButton/>
        </div>

        <div className="col-md-4 col-12 mb-3">
            <PlaceHolderButton/>
        </div>

        <div className="col-md-2 col-6 mb-3">
            <PlaceHolderButton/>
        </div>

        <div className="col-md-2 col-6 mb-3">
            <PlaceHolderButton/>
        </div>

        <div className="col-md-8 col-12 mb-3">
            <PlaceHolderButton height="100px"/>
        </div>

        <div className="col-md-2 col-6 mb-3">
            <PlaceHolderButton/>
        </div>
    </Fragment>
);


const Obligacion = () => {

    // cronograma
    const { edit, setEdit, loading, send, historial, setBlock, setSend, cronograma, setIsEditable, setIsUpdatable, cancel } = useContext(CronogramaContext);
    const [current_loading, setCurrentLoading] = useState(true);
    const [obligaciones, setObligaciones] = useState([]);
    const [old, setOld] = useState([]);
    const [error, setError] = useState(false);
    const [form, setForm] = useState({});
    const [current_option, setCurrentOption] = useState("");

    // app
    const app_context = useContext(AppContext);

    // obtener descuentos detallados
    const findObligaciones = async () => {
        setCurrentLoading(true);
        setBlock(true);
        await unujobs.get(`historial/${historial.id}/obligacion`)
            .then(async res => {
                let { data } = res;
                let { success, message } = data;
                if (!success) throw new Error(message);
                await setObligaciones(data.obligaciones);
                setOld(data.obligaciones);
            })
            .catch(err => {
                setObligaciones([]);
                setOld([]);
                setError(true);
            });
        setCurrentLoading(false);
        setBlock(false);
    }

    // primera carga
    useEffect(() => {
        setIsEditable(true);
        setIsUpdatable(true);
        if (historial.id) findObligaciones();
        return () => {}
    }, [historial.id]);

    // modificar obligaciones del cronograma
    const handleInput = ({ name, value }, index = 0) => {
        let newObligaciones = JSON.parse(JSON.stringify(obligaciones));
        let newObject = Object.assign({}, newObligaciones[index]);
        newObject[name] = value;
        newObligaciones[index] = newObject;
        setObligaciones(newObligaciones);
    }

    // actualizar las obligaciones del cronograma
    const updateObligacion = async () => {
        app_context.setCurrentLoading(true);
        let form = new FormData;
        form.append('obligaciones', JSON.stringify(obligaciones));
        await unujobs.post(`obligacion/${historial.id}/all`, form, { headers: { CronogramaID: historial.cronograma_id } })
        .then(async res => {
            app_context.setCurrentLoading(false);
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            findObligaciones();
            setEdit(false);
        })
        .catch(err => {
            app_context.setCurrentLoading(true);
            Swal.fire({ icon: 'error', text: err.message })
        });
        setBlock(false);
        setSend(false);
    }

    // cancelar cambios en las obligaciones
    const cancelObligacion = async () => {
        setObligaciones(JSON.parse(JSON.stringify(old)));
    }

    // quitar del cronograma la obligacion
    const deleteObligacion = async (id) => {
        let answer = await Confirm('warning', '¿Deseas eliminar la obligación judicial?', 'Confirmar')
        if (answer) {
            app_context.setCurrentLoading(true);
            await unujobs.post(`obligacion/${id}`, { _method: 'DELETE' }, { headers: { CronogramaID: historial.cronograma_id } })
            .then(async res => {
                app_context.setCurrentLoading(false);
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                findObligaciones();
                setEdit(false);
            }).catch(err => {
                app_context.setCurrentLoading(false);
                Swal.fire({ icon: 'error', text: err.message })
            });
            setBlock(false);
            setSend(false);
        }
    }

    // update obligaciones
    useEffect(() => {
        if (send) updateObligacion();
    }, [send]);
    
    // cancelar edicion
    useEffect(() => {
        if (cancel) cancelObligacion();
    }, [cancel]);

    // render
    return (
    <Form className="row">
        <div className="col-md-3">
            <Show condicion={!loading && !current_loading}
                predeterminado={<PlaceHolderButton/>}
            >
                <Button color="green"
                    fluid
                    disabled={!edit}
                    onClick={(e) => setCurrentOption("create")}
                >
                    <i className="fas fa-plus"></i>
                </Button>
            </Show>
        </div>

        <div className="col-md-12">
            <hr/>
        </div>

        <Show condicion={!loading && !current_loading}
            predeterminado={
                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-4 col-5">
                            <Skeleton/>
                        </div>

                        <div className="col-md-2 col-3">
                            <Skeleton/>
                        </div>
                    </div>
                </div>
            }
        >
            <h4 className="col-md-12 mt-1"><Icon name="list alternate"/> Lista de Obligaciones Judiciales:</h4>
        </Show>

        <Show condicion={!loading && !current_loading}
            predeterminado={<PlaceholderObligaciones/>}
        >
            {obligaciones.map((obl, index) =>
                <div className="col-md-12" key={`obl-${obl.id}`}>
                    <div className="row">
                        <div className="col-md-4 mb-2">
                            <Form.Field>
                                <label htmlFor="">Beneficiario</label>
                                <input type="text" 
                                    value={obl.person && obl.person.fullname || ""}
                                    readOnly
                                    className="uppercase"
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-2">
                            <label htmlFor="">Tip. Documento</label>
                            <Select
                                fluid
                                placeholder="Select. Tip. Documento"
                                options={storage.tipo_documento}
                                value={obl.tipo_documento}
                                name="tipo_documento"
                                disabled={!edit}
                                onChange={(e, obj) => handleInput(obj, index)}
                            />
                        </div>

                        <div className="col-md-2 mb-2">
                            <label htmlFor="">N° de Documento</label>
                            <Form.Field>
                                <input type="text" 
                                    name="numero_de_documento"
                                    value={obl.numero_de_documento || ""}
                                    disabled={!edit}
                                    onChange={({target}) => handleInput(target, index)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-2 mb-2">
                            <Form.Field>
                                <label htmlFor="">N° de Cuenta</label>
                                <input type="text" 
                                    name="numero_de_cuenta"
                                    value={obl.numero_de_cuenta || ""}
                                    disabled={!edit}
                                    onChange={({ target }) => handleInput(target, index)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-2 mb-2">
                            <Form.Field>
                                <label htmlFor="">Monto</label>
                                <input type="number" 
                                    name="monto"
                                    value={obl.monto || ""}
                                    onChange={({ target }) => handleInput(target, index)}
                                    disabled={obl.is_porcentaje || !edit}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-8 mb-2">
                            <Form.Field>
                                <label htmlFor="">Observación</label>
                                <textarea
                                    rows="4"
                                    value={obl.observacion || ""}
                                    name="observacion"
                                    disabled={!edit}
                                    onChange={({ target }) => handleInput(target, index)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-2 mb-2">
                            <Form.Field>
                                <label htmlFor="">Modo Descuento</label>
                                <Select
                                    fluid
                                    placeholder="Select. Porcentaje"
                                    options={[
                                        { key: "por", value: 1, text: "Desct. Porcentaje" },
                                        { key: "mon", value: 0, text: "Desct. Monto" }
                                    ]}
                                    name="is_porcentaje"
                                    value={obl.is_porcentaje}
                                    onChange={(e, target) => handleInput(target, index)}
                                    disabled={!edit}
                                />
                            </Form.Field>

                            <Show condicion={obl.is_porcentaje}>
                                <Form.Field className="mb-2">
                                    <label htmlFor="">Modo de Descuento</label>
                                    <Select
                                        name="modo"
                                        value={obl.modo}
                                        placeholder="Selecionar Modo"
                                        disabled={!edit}
                                        onChange={(e, target) => handleInput(target, index)}
                                        options={[
                                            {key: 'monto-bruto', value: 'BRUTO', text: 'Bruto'},
                                            {key: 'monto-neto', value: 'NETO', text: 'Neto'}
                                        ]}
                                    />
                                </Form.Field>
                            </Show>
                        </div>

                        <Show condicion={obl.is_porcentaje}
                            predeterminado={
                                <Show condicion={edit}>
                                    <div className='col-md-2 mb-2'>
                                        <Form.Field>
                                            <label htmlFor="">Opción</label>
                                            <Button color="red"
                                                fluid
                                                onClick={(e) => deleteObligacion(obl.id)}
                                            >
                                                <i className="fas fa-trash-alt"></i> Eliminar
                                            </Button>
                                        </Form.Field>
                                    </div>
                                </Show>
                            }
                        >
                            <div className="col-md-2 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Aplica Bonificaciones</label>
                                    <Checkbox 
                                        toggle
                                        checked={obl.bonificacion ? true : false}
                                        disabled={!edit}
                                        step="any"
                                        name="bonificacion"
                                        onChange={(e, obj) => handleInput({ name: obj.name, value: obj.checked ? true : false }, index)}
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label htmlFor="">Porcentaje</label>
                                    <input type="number" 
                                        value={obl.porcentaje || ""}
                                        disabled={!edit}
                                        step="any"
                                        name="porcentaje"
                                        onChange={({ target }) => handleInput(target, index)}
                                    />
                                </Form.Field>

                                <Show condicion={edit}>
                                    <Form.Field>
                                        <label htmlFor="">Opción</label>
                                        <Button color="red"
                                            fluid
                                            onClick={(e) => deleteObligacion(obl.id)}
                                        >
                                            <i className="fas fa-trash-alt"></i> Eliminar
                                        </Button>
                                    </Form.Field>
                                </Show>
                            </div>
                        </Show>
                                
                        <div className="col-md-12">
                            <hr/>
                        </div>
                    </div>
                </div>    
            )}
        </Show>

        <Show condicion={current_option == 'create'}>
            <AddObligacion
                isClose={(e) => setCurrentOption("")}
                onSave={(e) => findObligaciones()}
                info_id={historial.info_id}
                historial_id={historial.id}
            />
        </Show>
    </Form>)
}


export default Obligacion;