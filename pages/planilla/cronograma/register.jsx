import React, { Component } from 'react';
import { Form, Select, Button, Icon, Divider } from 'semantic-ui-react';
import Show from '../../../components/show';
import { unujobs } from '../../../services/apis';
import { parseOptions } from '../../../services/utils';
import Swal from 'sweetalert2';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';

export default class RegisterCronograma extends Component
{

    static getInititalProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        return { pathname: ctx.pathname, query: ctx.query };
    };

    state = {
        planillas: [],
        planilla_id: "",
        year: 2020,
        mes: 6,
        dias: 30,
        observacion: "",
        adicional: 0,
        remanente: 0,
        loading: true,
        errors: {},
        type_id: 0,
        types: [
            { key: "tipo-0", value: 0, text: "Planilla nueva" },
            { key: "tipo-1", value: 1, text: "Copiar del mes anterior"}
        ]
    }

    componentDidMount = async () => {
        let newDate = new Date();
        await this.getPlanillas();
        this.setState({
            year: newDate.getFullYear(),
            mes: newDate.getMonth() + 1,
            loading: false,
        });
    }

    handleInput = ({ name, value }) => {
        this.setState({[name]: value});
    }

    getPlanillas = async () => {
        await unujobs.get('planilla')
        .then(res => this.setState({ planillas: res.data }))
        .catch(err => console.log(err.message));
    }

    readySend = () => {
        let { planilla_id, year, mes, dias } = this.state;
        return planilla_id && year && mes && dias;
    }

    saveAndContinue = async () => {
        await this.setState({ loading: true });
        // send
        await unujobs.post('cronograma', this.state)
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
        })
        .catch(err => this.setState({ errors: err.response.data }));
        this.setState({ loading: false });
    }

    handleClose = () => {
        this.setState({ loading: true });
        let { push, pathname } = Router;
        let newPath = pathname.split('/');
        newPath.splice(-1, 1);
        push({  pathname: newPath.join('/') });
    }

    handleBack = async () => {
        this.setState({ loading: true });
        let { pathname, query } = Router;
        let newBack = pathname.split('/');
        newBack.splice(-1, 1);
        Router.push({ pathname: newBack.join('/') });
    }

    render() {

        return (
            <div className="col-md-12">

                <Button onClick={this.handleBack}
                    disabled={this.state.loading}
                >
                    <i className="fas fa-arrow-left"></i> Atrás
                </Button>
                
                <div className="card- mt-3">
                    <div className="card-header">
                        <i className="fas fa-plus ml-2"></i> Registrar Nuevo Cronograma
                    </div>
                    <div className="card-body">
                        <div className="row justify-content-center">
                            <Form loading={this.state.loading} action="#" className="col-md-10" onSubmit={(e) => e.preventDefault()}>
                                <div className="row justify-content-center">
                                        <Form.Field className="col-md-6">
                                            <label htmlFor="" className="text-left">Planilla</label>
                                            <Select placeholder="Select. Planilla"
                                                options={parseOptions(this.state.planillas, ["", "", "Select. Planilla"], ["id", "id", "nombre"])}
                                                name="planilla_id"
                                                value={this.state.planilla_id}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                        </Form.Field>

                                        <Form.Field className="col-md-6">
                                            <Form.Input
                                                className="text-left"
                                                error={null}
                                                fluid
                                                label="Año"
                                                name="year"
                                                type="number"
                                                value={this.state.year}  
                                                onChange={(e, obj) => this.handleInput(obj)}
                                                placeholder='Ingrese el año'
                                                disabled
                                            />
                                        </Form.Field>

                                        <Form.Field className="col-md-6">
                                            <Form.Input
                                                className="text-left"
                                                error={null}
                                                type="number"
                                                fluid
                                                label="Mes"
                                                name="mes"
                                                value={this.state.mes}  
                                                onChange={(e, obj) => this.handleInput(obj)}
                                                placeholder='Ingrese el mes'
                                            />
                                        </Form.Field>

                                        <Form.Field className="col-md-6">
                                            <Form.Input
                                                className="text-left"
                                                error={null}
                                                type="number"
                                                fluid
                                                label="Dias"
                                                name="dias"
                                                value={this.state.dias}  
                                                onChange={(e, obj) => this.handleInput(obj)}
                                                placeholder='Ingrese los dias'
                                                disabled={!this.state.adicional}
                                            />
                                        </Form.Field>

                                    <Show condicion={this.state.adicional == 0}>
                                        <Form.Field className="text-left col-md-6">
                                            <label htmlFor="">Modo de creación</label>
                                            <Select
                                                options={this.state.types}
                                                value={this.state.type_id}
                                                name="type_id"
                                                fluid
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </Show>

                                    <Show condicion={this.state.mes != 12}>
                                        <Form.Field className="col-md-6">
                                            <label htmlFor="">¿Es una planilla adicional?</label>
                                            <Select
                                                name="adicional"
                                                value={this.state.adicional}
                                                placeholder="Select. Planilla Adicional"
                                                options={[
                                                    {key: "si", value: 1, text: "Si"},
                                                    {key: "no", value: 0, text: "No"}
                                                ]}
                                                onChange={(e, obj) => this.handleInput(obj)}
                                            />
                                        </Form.Field>
                                    </Show>

                                    <Show condicion={this.state.mes == 12}>
                                        <Form.Field className="col-md-6">
                                            <label htmlFor="">¿Es una planilla remanente?</label>
                                            <Select
                                                name="remanente"
                                                value={this.state.remanente}
                                                placeholder="Select. Planilla Remanente"
                                                onChange={(e, obj) => this.handleInput(obj)}
                                                options={[
                                                    {key: "si", value: 1, text: "Si"},
                                                    {key: "no", value: 0, text: "No"}
                                                ]}
                                            />
                                        </Form.Field>
                                    </Show>

                                
                                    <Form.Field className="col-md-12">
                                        <label htmlFor="" className="text-left">Observación</label>
                                        <textarea name="observacion"
                                            rows="6"
                                            value={this.state.observacion}
                                            placeholder="Ingrese una observación para el cronograma"
                                            onChange={({ target }) => this.handleInput(target)}
                                        />
                                    </Form.Field>

                                    <Divider/>

                            
                                    <div className="col-md-12 text-right">
                                        <Button color="teal"
                                            disabled={!this.readySend()}
                                            onClick={this.saveAndContinue}
                                            loading={this.state.loading}
                                        >
                                            <Icon name="save"/> Guardar y Continuar
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}