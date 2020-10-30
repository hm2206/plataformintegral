import React, { Fragment, useState, useContext, useEffect } from 'react';
import { unujobs } from '../../services/apis';
import { Button, Form, Select, Icon, Checkbox } from 'semantic-ui-react';
import Show from '../show';
import storage from '../../services/storage.json';
import Swal from 'sweetalert2';
import { responsive } from '../../services/storage.json';
import {  Confirm } from '../../services/utils';
import Skeleton from 'react-loading-skeleton';
import { CronogramaContext } from '../../contexts/CronogramaContext';
import { AppContext } from '../../contexts/AppContext';

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
    const { edit, setEdit, loading, send, historial, setBlock, setSend, cronograma, setIsEditable, setIsUpdatable } = useContext(CronogramaContext);
    const [current_loading, setCurrentLoading] = useState(true);
    const [obligaciones, setObligaciones] = useState([]);
    const [old, setOld] = useState([]);
    const [error, setError] = useState(false);
    const [form, setForm] = useState({});

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


    // create = async () => {
    //     let answer = await Confirm('warning', '¿Deseas guardar la obligación judicial?');
    //     if (answer) {
    //         this.setState({ loader: true });
    //         let form = Object.assign({}, this.state.form);
    //         form.info_id = this.props.historial.info_id;
    //         await unujobs.post('type_obligacion', form)
    //         .then(async res => {
    //             let { success, message } = res.data;
    //             let icon = success ? 'success' : 'error';
    //             await Swal.fire({ icon, text: message });
    //             let { historial } = this.props;
    //             // is success
    //             if (success) {
    //                 await unujobs.post(`cronograma/${historial.cronograma_id}/add_obligacion`, {}, { headers: { CronogramaID: historial.cronograma_id } })
    //                 .then(async res => {
    //                     let { success, message } = res.data;
    //                     let icon = success ? 'success' : 'error';
    //                     await Swal.fire({ icon, text: message });
    //                 })
    //                 .catch(err => Swal.fire({ icon: 'error', text: err.message }));
    //                 await this.getObligaciones(this.props);
    //                 await this.props.updatingHistorial();
    //             }
    //         })
    //         .catch(err => Swal.fire({ icon: 'error', text: err.message }));
    //         this.setState({ loader: false });
    //     }
    // }

    // getDatosReniec = async (dni) => {
    //     this.setState({ loader: true });
    //     await unujobs.get(`reniec/${dni}`)
    //     .then(res => {
    //         let { result, success } = res.data;
    //         if (success) {
    //             let data = {};
    //             data.name = 'beneficiario';
    //             data.value = `${result.paterno} ${result.materno} ${result.nombre}`;
    //             this.handleInput(data);
    //         } else {
    //             this.handleInput({ name: "beneficiario", value: "No se encontró resultado" })
    //         }
    //     })
    //     .catch(err => console.log(err.message));
    //     this.setState({ loader: false });
    // }

    // handleInput = ({ name, value }) => {
    //     let newObject = Object.assign({}, this.state.form);
    //     newObject[name] = value;
    //     this.setState({ form: newObject});
    // }

    // handleInputUpdate = ({ name, value }, index = 0) => {
    //     let { obligaciones } = this.state;
    //     let newObject = Object.assign({}, obligaciones[index]);
    //     newObject[name] = value;
    //     obligaciones[index] = newObject;
    //     this.setState({ obligaciones });
    // }

    // permisionAdd = () => {
    //     let { tipo_documento, numero_de_documento, beneficiario, monto, porcentaje } = this.state.form;
    //     return tipo_documento && numero_de_documento &&  beneficiario && (monto || porcentaje);
    // }

    // update = async () => {
    //     let form = new FormData;
    //     form.append('obligaciones', JSON.stringify(this.state.obligaciones));
    //     let { historial } = this.props;
    //     await unujobs.post(`obligacion/${this.props.historial.id}/all`, form, { headers: { CronogramaID: historial.cronograma_id } })
    //     .then(async res => {
    //         this.props.setLoading(false);
    //         let { success, message } = res.data;
    //         if (!success) throw new Error(message);
    //         await Swal.fire({ icon: 'success', text: message });
    //         await this.props.updatingHistorial();
    //         this.getObligaciones(this.props);
    //     })
    //     .catch(err => Swal.fire({ icon: 'error', text: err.message }));
    //     this.props.setLoading(false);
    //     this.props.setSend(false);
    // }

    // delete = async (id) => {
    //     let answer = await Confirm('warning', '¿Deseas eliminar la obligación judicial?', 'Confirmar')
    //     if (answer) {
    //         this.setState({ loader: true });
    //         let { historial } = this.props;
    //         await unujobs.post(`obligacion/${id}`, { _method: 'DELETE' }, { headers: { CronogramaID: historial.cronograma_id } })
    //         .then(async res => {
    //             this.props.setLoading(false);
    //             let { success, message } = res.data;
    //             if (!success) throw new Error(message);
    //             await Swal.fire({ icon: 'success', text: message });
    //             await this.props.updatingHistorial();
    //             this.getObligaciones(this.props);
    //         }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
    //         this.setState({ loader: false });
    //         this.props.setEdit(false);
    //         this.props.setSend(false);
    //         this.props.setLoading(false);
    //     }
    // }
    
    return (
    <Form className="row">

        <div className="col-md-3">
            <Show condicion={!loading && !current_loading}
                predeterminado={<PlaceHolderButton/>}
            >
                <Button color="green"
                    fluid
                    disabled={!edit}
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
                        <div className="col-md-2">
                            <label htmlFor="">Tip. Documento</label>
                            <Select
                                fluid
                                placeholder="Select. Tip. Documento"
                                options={storage.tipo_documento}
                                value={obl.tipo_documento}
                                disabled={true}
                            />
                        </div>

                        <div className="col-md-2 mb-2">
                            <label htmlFor="">N° de Documento</label>
                            <Form.Field>
                                <input type="text" 
                                    defaultValue={obl.numero_de_documento}
                                    disabled={true}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-4 mb-2">
                            <Form.Field>
                                <label htmlFor="">Beneficiario</label>
                                <input type="text" 
                                    defaultValue={obl.beneficiario}
                                    disabled={true}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-2 mb-2">
                            <Form.Field>
                                <label htmlFor="">N° de Cuenta</label>
                                <input type="text" 
                                    name="numero_de_cuenta"
                                    value={obl.numero_de_cuenta}
                                    disabled={!edit}
                                    onChange={({ target }) => this.handleInputUpdate(target, index)}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-2 mb-2">
                            <Form.Field>
                                <label htmlFor="">Monto</label>
                                <input type="number" 
                                    name="monto"
                                    value={obl.monto}
                                    onChange={({ target }) => this.handleInputUpdate(target, index)}
                                    disabled={obl.is_porcentaje || !edit}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-8 mb-2">
                            <Form.Field>
                                <label htmlFor="">Observación</label>
                                <textarea
                                    rows="4"
                                    value={obl.observacion}
                                    name="observacion"
                                    disabled={!edit}
                                    onChange={({ target }) => this.handleInputUpdate(target, index)}
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
                                    // onChange={(e, target) => this.handleInputUpdate(target, index)}
                                    disabled={!edit}
                                />
                            </Form.Field>
                        </div>

                        <Show condicion={obl.is_porcentaje}>
                            <div className="col-md-2 mb-2">
                                <Form.Field>
                                    <label htmlFor="">Porcentaje</label>
                                    <input type="number" 
                                        value={obl.porcentaje}
                                        disabled={!edit}
                                        step="any"
                                        name="porcentaje"
                                        onChange={({ target }) => this.handleInputUpdate(target, index)}
                                    />
                                </Form.Field>
                            </div>
                        </Show>
                                
                        <div className="col-md-10"></div>

                        <Show condicion={edit}>
                            <div className="col-md-2 col-12 text-right">
                                <Button color="red"
                                    fluid
                                    // onClick={(e) => this.delete(obl.id)}
                                >
                                    <i className="fas fa-trash-alt"></i> Eliminar
                                </Button>
                            </div>
                        </Show>

                        <div className="col-md-12">
                            <hr/>
                        </div>
                    </div>
                </div>    
            )}
        </Show>
    </Form>)
}


export default Obligacion;