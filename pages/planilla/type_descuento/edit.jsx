import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select, Checkbox } from 'semantic-ui-react'
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';
import Show from '../../../components/show';
import { AUTHENTICATE } from '../../../services/auth';


export default class EditTypeDescuento extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        edit: false,
        old: {},
        form: { 
            plame: 0,
            edit: 0
        },
        errors: {}
    }

    componentDidMount = async () => {
        await this.findTypeDescuento();
    }

    findTypeDescuento = async () => {
        this.setState({ loading: true });
        let { query } = this.props;
        let id = query.id ? atob(query.id) : '__error';
        await unujobs.get(`type_descuento/${id}`)
        .then(res => {
            let { success, message, type_descuento } = res.data;
            if (!success) throw new Error(message);
            this.setState({ form: type_descuento, old: JSON.parse(JSON.stringify(type_descuento))});
        })
        .catch(err => this.setState({ form: {}, old: {} }));
        this.setState({ loading: false });
    }

    handleInput = ({ name, value }, obj = 'form') => {
        this.setState((state, props) => {
            let newObj = Object.assign({}, state[obj]);
            newObj[name] = value;
            state.errors[name] = "";
            return { [obj]: newObj, errors: state.errors, edit: true };
        });
    }

    save = async () => {
        this.setState({ loading: true });
        let { form } = this.state;
        form._method = 'PUT';
        await unujobs.post(`type_descuento/${form.id}`, form)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            if (success) this.setState(state => ({ old: state.form, errors: {}, edit: false }));
        })
        .catch(async err => {
            try {
                let { data } = err.response
                let { message, errors } = data;
                this.setState({ errors });
            } catch (error) {
                await Swal.fire({ icon: 'error', text: 'Algo salió mal' });
            }
        });
        this.setState({ loading: false });
    }

    render() {

        let { pathname, query } = this.props;
        let { form, errors, edit } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Editar Tip. Descuento
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-10">
                                <div className="row justify-content-end">
                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.key && errors.key[0]}>
                                            <label htmlFor="">ID-MANUAL</label>
                                            <input type="text"
                                                disabled
                                                placeholder="Ingrese un identificador unico"
                                                name="key"
                                                value={form.key || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.key && errors.key[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field error={errors && errors.descripcion && errors.descripcion[0]}>
                                            <label htmlFor="">Descripción</label>
                                            <input type="text"
                                                placeholder="Ingrese una descripción"
                                                name="descripcion"
                                                value={form.descripcion || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                            />
                                            <label>{errors && errors.descripcion && errors.descripcion[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">¿Mostrar en el Reporte Plame?</label>
                                            <Checkbox toggle checked={form.plame ? true : false} 
                                                disabled={this.state.loading}
                                                name="plame"
                                                onChange={(e, obj) => this.handleInput({ name: obj.name, value: obj.checked ? 1 : 0 })}
                                            />
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Form.Field>
                                            <label htmlFor="">¿Edicion/Descuento Manual?</label>
                                            <Checkbox toggle checked={form.edit ? true : false} disabled/>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                    </div>

                                    <div className="col-md-4 text-right">
                                        <Show condicion={edit}>
                                            <Button color="red"
                                                disabled={this.state.loading}
                                                onClick={(e) => this.setState(state => ({ errors: {}, edit: false, form: state.old }))}
                                            >
                                                <i className="fas fa-times"></i> Cancelar
                                            </Button>
                                        </Show>
                                        
                                        <Button color="teal"
                                            disabled={!edit || this.state.loading}
                                            loading={this.state.loading}
                                            onClick={this.save}
                                        >
                                            <i className="fas fa-save"></i> Guardar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    </div>
                </Body>
            </div>
        )
    }
    
}