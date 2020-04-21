import React, { Component, Fragment } from 'react'
import { Form, Image, Select, Button } from 'semantic-ui-react';
import Router from 'next/router';
import { authentication, unujobs } from '../../../services/apis';
import { parseOptions, backUrl, Confirm } from '../../../services/utils';
import Show from '../../../components/show';
import Swal from 'sweetalert2';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack } from '../../../components/Utils';
import { findPerson } from '../../../storage/actions/personActions';
import { tipo_documento } from '../../../services/storage.json';
import ConsultaIframe from '../../../components/consultaIframe'
import btoa from 'btoa';

export default class AddWork extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname, store } = ctx;
        await store.dispatch(findPerson(ctx));
        // response
        let { person } = await store.getState().person;
        return { query, pathname, person }
    }

    state = {
        loader: false,
        block: false,
        ssp: false,
        essalud: false,
        afps: [],
        bancos: [],
        form: {
            banco_id: 1,
            numero_de_cuenta: "",
            afp_id: 1,
            numero_de_cussp: "",
            fecha_de_afiliacion: "",
            numero_de_essalud: "",
            prima_seguro: 1,
        }
    }

    componentDidMount = () => {
        this.getAfps();
        this.getBancos();
    }

    handleBack = () => {
        let { pathname, query, push } = Router;
        this.setState({ loader: true });
        if (query.href) {
            push(query.href);
        } else {
            push({ pathname: backUrl(pathname) });
        }
    }

    handleInput = async ({ name, value }, object = 'form') => {
        let newObj = Object.assign({}, this.state[object]);
        newObj[name] = value;
        await this.setState({ [object]: newObj });
    }

    getAfps = async () => {
        this.setState({ loader: true });
        await unujobs.get(`afp`)
        .then(res => {
            this.setState({ afps: res.data });
        }).catch(err => console.log(err.message));
        this.setState({ loader: false });
    }

    getBancos = async () => {
        this.setState({ loader: true });
        await unujobs.get(`banco`)
        .then(res => {
            this.setState({ bancos: res.data });
        }).catch(err => console.log(err.message));
        this.setState({ loader: false });
    }

    create = async () => {
        let safe = await Confirm('warning', '¿Desea guardar los datos?', 'Aceptar');
        if (safe) {
            this.setState({ loader: true });
            let newForm = Object.assign({}, this.state.form);
            newForm.person_id = this.props.person.id;
            newForm.orden = this.props.person.fullname;
            await unujobs.post('work', newForm)
            .then(async res => {
                let { success, message, body } = res.data;
                let icon = success ? 'success' : 'error';
                await Swal.fire({ icon, text: message });
                if (body) {
                    let answer = await Confirm("warning", "¿Desea agregarle un contrato?", "Aceptar");
                    if (answer) {
                        let { push } = Router;
                        let  id = btoa(body.id);
                        await push({ pathname: '/planilla/contrato/register', query: { id } });
                    }
                }
            })
            .catch(err => Swal.fire({ icon: 'error', text: "Algo salió mal" }))
            this.setState({ loader: false });
        }
    }

    render() {    

        let { form } = this.state;
        let { person } = this.props;

            return (
                <Fragment>
                    <div className="col-md-12">
                        <Body>
                            <div className="card-header">
                                <BtnBack onClick={this.handleBack}/> <span className="ml-3"><i className="fas fa-info-circle"></i> Agregar Información del trabajador</span>
                            </div>

                            <div className="card-body">
                                <Form loading={this.state.loader}>
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <div className="row justify-content-center">
                                                <Image circular 
                                                    src={person.image ? `${authentication.path}/${person.image}` : '/img/perfil.jpg'}
                                                    size="small"
                                                    style={{ width: "150px", height: "150px", objectFit: "contain" }}
                                                />  

                                                <div className="col-md-12 text-center mt-4">
                                                    <h4 className="mb-1">{person.fullname}</h4>
                                                    <b>
                                                        <Show condicion={person.document_type == '01'}>
                                                            {tipo_documento[0].text}
                                                        </Show>
                                                        <Show condicion={person.document_type == '04'}>
                                                            {tipo_documento[1].text}
                                                        </Show>
                                                        <Show condicion={person.document_type == '07'}>
                                                            {tipo_documento[2].text}
                                                        </Show>
                                                        <Show condicion={person.document_type == '09'}>
                                                            {tipo_documento[3].text}
                                                        </Show>
                                                    </b>
                                                    <b>: {person.document_number}</b>
                                                </div>
                                                
                                                <div className="col-md-12 mt-3">
                                                    <div className="row justify-content-around">
                                                        <div className="col-md-6">
                                                            <Button fluid
                                                                onClick={(e) => this.setState({ ssp: true })}
                                                            >
                                                                <i className="fas fa-file mr-2"></i>
                                                                Consulta SSP
                                                            </Button>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <Button fluid
                                                                onClick={(e) => this.setState({ essalud: true })}
                                                            >
                                                                <i className="fas fa-file mr-2"></i>
                                                                Consulta Essalud
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-8">
                                            <div className="row">
                                                <div className="col-md-6 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">ID-PERSON <b className="text-red">*</b></label>
                                                        <input type="text" disabled value={person.id}/>
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-6 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">N° de Essalud</label>
                                                        <input type="text" 
                                                            value={form.numero_de_essalud} 
                                                            name="numero_de_essalud"
                                                            onChange={(e) => this.handleInput(e.target)}
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-6 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">Tip. Banco <b className="text-red">*</b></label>
                                                        <Select
                                                            options={parseOptions(this.state.bancos, ['sel-banco', "", 'Select. Tip. Banco'], ['id', 'id', 'nombre'])}
                                                            name="banco_id"
                                                            value={form.banco_id}
                                                            onChange={(e, obj) => this.handleInput(obj)}
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-6 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">N° Cuenta</label>
                                                        <input
                                                            type="text"
                                                            name="numero_de_cuenta"
                                                            value={form.numero_de_cuenta}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-6 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">Tip. AFP <b className="text-red">*</b></label>
                                                        <Select
                                                            options={parseOptions(this.state.afps, ['sel-afp', "", 'Select. Tip. AFP'], ['id', 'id', 'descripcion'])}
                                                            name="afp_id"
                                                            value={form.afp_id}
                                                            onChange={(e, obj) => this.handleInput(obj)}
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-6 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">N° de Cussp</label>
                                                        <input type="text"
                                                            name="numero_de_cussp"
                                                            value={form.numero_de_cussp}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-6 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">Fecha de Afiliación</label>
                                                        <input type="date" 
                                                            name="fecha_de_afiliacion"
                                                            value={form.fecha_de_afiliacion}
                                                            onChange={(e) => this.handleInput(e.target)}
                                                        />
                                                    </Form.Field>
                                                </div>

                                                <div className="col-md-6 mb-2">
                                                    <Form.Field>
                                                        <label htmlFor="">Prima Seguro</label>
                                                        <Select
                                                            options={[
                                                                {key: "no-afecto", value: 0, text: "No afecto"},
                                                                {key: "afecto", value: 1, text: "afecto" }
                                                            ]}
                                                            name="prima_seguro"
                                                            value={form.prima_seguro}
                                                            onChange={(e, obj) => this.handleInput(obj)}
                                                        />
                                                    </Form.Field>
                                                </div>
                                            </div>
                                        </div>                    

                                        <div className="col-md-12 text-right">
                                            <hr/>
                                            <Button color="teal"
                                                onClick={this.create}
                                                disabled={this.state.loader}
                                            >
                                                <i className="fas fa-save"></i> Guardar y Continuar
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </Body>
                    </div>

                    {/* Render tools */}
                    <ConsultaIframe 
                        isClose={(e) => this.setState({ ssp: false })}
                        show={this.state.ssp}
                        titulo="Consulta al Sistema Privado de Pensiones"
                        url="https://www2.sbs.gob.pe/afiliados/paginas/Consulta.aspx"
                    />
                    <ConsultaIframe 
                        isClose={(e) => this.setState({ essalud: false })}
                        md="8"
                        show={this.state.essalud}
                        titulo="Consulta al Sistema de  Essalud"
                        url="http://ww4.essalud.gob.pe:7777/acredita/"
                    />
                </Fragment>
            )
        }
}