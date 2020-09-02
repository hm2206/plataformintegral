import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button, Select, Checkbox } from 'semantic-ui-react'
import { unujobs, tramite } from '../../../services/apis';
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
        await this.findTramiteType();
    }

    findTramiteType = async () => {
        this.setState({ loading: true });
        let { query } = this.props;
        let id = query.id ? atob(query.id) : '__error';
        await tramite.get(`tramite_type/${id}`)
        .then(res => {
            let { success, tramite_type, message } = res.data;
            if (!success) throw new Error(message);
            this.setState({ form: tramite_type, old: tramite_type })
        })
        .catch(err => {
            Swal.fire({ icon: 'error', text: err.message });
            this.setState({ form: {}, old: {} })
        });
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
        await tramite.post(`tramite_type/${form.id}/update`, form)
        .then(async res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            this.setState(state => ({ old: state.form, errors: {}, edit: false }));
        })
        .catch(async err => {
            try {
                let { message, errors } = JSON.parse(err.message);
                this.setState({ errors });
                Swal.fire({ icon: 'warning', text: message });
            } catch (error) {
                await Swal.fire({ icon: 'error', text: err.message });
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
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Editar Tip. Trámite
                    </div>
                    <div className="card-body">
                        <Form className="row justify-content-center">
                            <div className="col-md-7">
                                <div className="row justify-center">
                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.short_name && errors.short_name[0]}>
                                            <label htmlFor="">Nombre Corto <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese una nombre corto"
                                                name="short_name"
                                                value={form.short_name || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                                className="uppercase"
                                            />
                                            <label>{errors && errors.short_name && errors.short_name[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Form.Field error={errors && errors.description && errors.description[0]}>
                                            <label htmlFor="">Descripción <b className="text-red">*</b></label>
                                            <input type="text"
                                                placeholder="Ingrese una descripción"
                                                name="description"
                                                value={form.description || ""}
                                                onChange={(e) => this.handleInput(e.target)}
                                                className="uppercase"
                                            />
                                            <label>{errors && errors.description && errors.description[0]}</label>
                                        </Form.Field>
                                    </div>

                                    <div className="col-md-12">
                                        <hr/>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="text-right">
                                            <Button color="red"
                                                disabled={!this.state.edit}
                                                onClick={(e) => this.setState(state => ({ form: state.old, edit: false }))}
                                            >
                                                <i className="fas fa-times"></i> Cancelar
                                            </Button>

                                            <Button color="teal"
                                                disabled={!this.state.edit}
                                                onClick={this.save}
                                            >
                                                <i className="fas fa-save"></i> Guardar
                                            </Button>
                                        </div>
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