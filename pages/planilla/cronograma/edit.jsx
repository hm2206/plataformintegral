import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl } from '../../../services/utils';
import { Form, Button } from 'semantic-ui-react';
import { unujobs } from '../../../services/apis';
import Router from 'next/router';

export default class EditCronograma extends Component
{
    static getInitialProps = (ctx) => {
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
        this.setState({ loading: true });
        let { pathname, push } = Router;
        push({ pathname: backUrl(pathname) });
    }

    getCronograma = async () => {
        this.setState({ loader: true });
        await unujobs.get(`cronograma/${this.state.id}`)
        .then(res => {
            let { cronograma } = res.data;
            this.setState({ cronograma })
        })
        .catch(err => Swal.fire({ icon: 'error', text: err.message }));
        this.setState({ loader: false });
    }

    handleInput = ({ name, value }) => {
        let newObj = Object.assign({}, this.state.cronograma);
        newObj[name] = value;
        this.setState({ cronograma: newObj });
    }

    update = async () => {
        this.setState({ loader: true });
        let form = new FormData;
        form.append('descripcion', this.state.cronograma.descripcion);
        form.append('observacion', this.state.cronograma.observacion);
        form.append('sello', this.state.cronograma.sello);
        form.append('token_verify', this.state.cronograma.token_verify);
        form.append('_method', 'PUT');
        await unujobs.post(`cronograma/${this.state.id}`, form)
        .then(res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            Swal.fire({ icon, text: message });
            if (success) this.getCronograma();
        })
        .catch(err => Swal.fire({ icon: 'error', text: err.message }));
        this.setState({ loader: false });
    }

    render() {
        
        let { cronograma, loader } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={this.handleBack}/> 
                        <span className="ml-2">Editar Cronograma <b>#</b></span>
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
                                <Button color="red">
                                    <i className="fas fa-trash-alt"></i> Eliminar
                                </Button>

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