import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl, Confirm } from '../../../services/utils';
import { Form, Button } from 'semantic-ui-react';
import { unujobs } from '../../../services/apis';
import Router from 'next/router';
import Swal from 'sweetalert2'
import { AUTHENTICATE } from '../../../services/auth';
import Show from '../../../components/show';

export default class EditCronograma extends Component
{
    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname } = ctx;
        return { query, pathname }
    }

    state = {
        id: "",
        loader: false,
        cronograma: {}
    }


    componentDidMount = async () => {
        await this.setState((state, props) => ({ id: props.query.id ? atob(props.query.id) : "" }));
        this.getCronograma();
    }

    handleBack = (e) => {
        let { cronograma } = this.state;
        let { pathname, push } = Router;
        push({ pathname: backUrl(pathname), query: { mes: cronograma.mes, year: cronograma.year } });
    }

    getCronograma = async () => {
        this.props.fireLoading(true);
        await unujobs.get(`cronograma/${this.state.id}`)
        .then(res => {
            let { cronograma } = res.data;
            // add entity
            this.props.fireEntity({ render: true, disabled: true, entity_id: cronograma.entity_id });
            // datos
            this.setState({ cronograma })
        })
        .catch(err => {
            this.props.fireLoading(true);
            Swal.fire({ icon: 'error', text: err.message })
        });
        this.props.fireLoading(false);
    }

    handleInput = ({ name, value }) => {
        let newObj = Object.assign({}, this.state.cronograma);
        newObj[name] = value;
        this.setState({ cronograma: newObj });
    }

    update = async () => {
        this.props.fireLoading(true);
        let form = new FormData;
        form.append('descripcion', this.state.cronograma.descripcion);
        form.append('observacion', this.state.cronograma.observacion);
        form.append('sello', this.state.cronograma.sello);
        form.append('token_verify', this.state.cronograma.token_verify);
        form.append('_method', 'PUT');
        await unujobs.post(`cronograma/${this.state.id}`, form)
        .then(async res => {
            this.props.fireLoading(false);
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) this.getCronograma();
        })
        .catch(err => {
            this.props.fireLoading(false);
            Swal.fire({ icon: 'error', text: err.message })
        });
    }

    destroy = async () => {
        let answer = await Confirm('warning', `¿Estas seguro en eliminar el cronograma permanentemente?`, 'Eliminar');
        if (answer) {
            // let conf = await Confirm('warning', `¿Deseas anular los contratos de está planilla?`, 'Confirmar');
            let anulado = 0;
            this.props.fireLoading(true);
            let form = new FormData;
            form.append('_method', 'DELETE');
            form.append('anulado', anulado);
            await unujobs.post(`cronograma/${this.state.id}`, form)
                .then(async res => {
                    this.props.fireLoading(false);
                    let { success, message } = res.data;
                    if (!success) throw new Error(message);
                    await Swal.fire({ icon: 'success', text: message })
                    let { push, pathname } = Router;
                    push(backUrl(pathname));
                }).catch(err => {
                    this.props.fireLoading(false);
                    Swal.fire({ icon: 'error', text: err.message });
                });
        }
    }

    render() {
        
        let { cronograma, loader } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={this.handleBack}/> 
                        <span className="ml-2">Editar Cronograma <b>#{cronograma && cronograma.id}</b></span>
                        <hr/>
                    </div>
                    <Form className="card-body" loading={this.state.loader}>
                        <div className="row">
                            <div className="col-md-12">
                                <b>( <b className="text-red">*</b> ) Campos obligatorios</b>
                                <hr/>
                            </div>

                            <div className="col-md-4">
                                <Form.Field>
                                    <label htmlFor="">Planilla</label>
                                    <input type="text"
                                        disabled
                                        defaultValue={cronograma.planilla && cronograma.planilla.nombre}
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label htmlFor="">Adicional</label>
                                    <input type="text" 
                                        defaultValue={cronograma.adicional ? cronograma.adicional : ' No'}
                                        disabled={true}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-4">
                                <Form.Field>
                                    <label htmlFor="">Año</label>
                                    <input type="text"
                                        defaultValue={cronograma.year}
                                        disabled
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label htmlFor="">Remanente</label>
                                    <input type="text"
                                        defaultValue={cronograma.remanente ? 'Si' : 'No'}
                                        disabled
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-4">
                                <Form.Field>
                                    <label htmlFor="">Mes</label>
                                    <input type="text"
                                        defaultValue={cronograma.mes}
                                        disabled
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label htmlFor="">Dias</label>
                                    <input type="text"
                                        defaultValue={cronograma.dias}
                                        disabled
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mt-3">
                                <Form.Field>
                                    <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                    <input type="text"
                                        value={cronograma.descripcion ? cronograma.descripcion : ''}
                                        disabled={loader}
                                        name="descripcion"
                                        onChange={({ target }) => this.handleInput(target)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-2 mt-3">
                                <Form.Field>
                                    <label htmlFor="">Sello</label>
                                    <label htmlFor="sello" className="ui black button text-white">
                                        <i className="fas fa-file"></i>
                                        <input type="file" 
                                            accept="image/*"
                                            id="sello"
                                            hidden
                                            name="sello"
                                            onChange={({ target }) => this.handleInput({ name: target.name, value: target.files[0] })}
                                        />
                                    </label>
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mt-3">
                                <Form.Field>
                                    <label htmlFor="">Observación <b className="text-red">*</b></label>
                                    <textarea name="" id="" cols="30" rows="10"
                                        value={cronograma.observacion}
                                        name="observacion"
                                        onChange={({ target }) => this.handleInput(target)}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-6 mt-3 text-center">
                                <b><i className="fas fa-image"></i> Imagen del Sello</b> <br/>
                                <img src={cronograma.sello} alt="sello"
                                    style={{ border: "1px solid #000", width: "300px", height: "200px", objectFit: "contain" }}
                                />
                            </div>

                            <div className="col-md-12 text-right">
                                <hr/>
                                <Show condicion={cronograma.estado}>
                                    <Button color="red"
                                        onClick={this.destroy}
                                    >
                                        <i className="fas fa-trash"></i> Eliminar Cronograma
                                    </Button>

                                </Show>
                                <Button color="teal"
                                    onClick={this.update}
                                >
                                    <i className="fas fa-save"></i> Guardar cambios
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Body>
            </div>
        )
    }

}