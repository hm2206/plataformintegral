import React, { Component } from 'react';
import { Body, BtnBack } from '../../../components/Utils';
import { backUrl } from '../../../services/utils';
import Router from 'next/router';
import { Form, Button } from 'semantic-ui-react'
import { tramite } from '../../../services/apis';
import Swal from 'sweetalert2';


export default class CreateTramiteType extends Component
{

    static getInitialProps = (ctx) => {
        let { pathname, query } = ctx;
        return { pathname, query };
    }

    state = {
        loading: false,
        form: { },
        errors: {}
    }

    handleInput = ({ name, value }, obj = 'form') => {
        this.setState((state, props) => {
            let newObj = Object.assign({}, state[obj]);
            newObj[name] = value;
            state.errors[name] = "";
            return { [obj]: newObj, errors: state.errors };
        });
    }

    save = async () => {
        this.setState({ loading: true });
        await tramite.post('tramite_type', this.state.form)
        .then(async res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            await Swal.fire({ icon: 'success', text: message });
            if (success) this.setState({ form: {}, errors: {} })
        })
        .catch(async err => {
            try {
                let { message, errors } = JSON.parse(err.message);
                this.setState({ errors });
            } catch (error) {
                await Swal.fire({ icon: 'error', text: err.message });
            }
        });
        this.setState({ loading: false });
    }

    render() {

        let { pathname, query } = this.props;
        let { form, errors } = this.state;

        return (
            <div className="col-md-12">
                <Body>
                    <div className="card-header">
                        <BtnBack onClick={(e) => Router.push(backUrl(pathname))}/> Crear Tip. Trámite
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
                                            <Button color="teal"
                                                loading={this.state.loading}
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