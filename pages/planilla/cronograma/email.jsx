import React, { Component, Fragment } from 'react';
import { AUTHENTICATE } from '../../../services/auth';
import { Body, BtnBack, BtnFloat } from '../../../components/Utils';
import { unujobs } from '../../../services/apis';
import { Form, Button, List, Image, Select } from 'semantic-ui-react';
import Show from '../../../components/show';
import Router from 'next/router';
import { backUrl, Confirm } from '../../../services/utils';
import atob from 'atob';
import Swal from 'sweetalert2';


export default class CronogramaEmail extends Component
{
    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        return { pathname, query };
    };

    state = {
        loading: false,
        page: 1,
        query_search: "",
        send_email: "SIN_FILTER",
        enviados: 0,
        no_enviados: 0,
        errors: [],
        cronograma: {},
        historial: {
            data: []
        }
    }

    componentDidMount = async () => {
        await this.getSentEmail(false);
    }

    handleBack = (e) => {
        this.setState({ loading: true });
        let { cronograma } = this.state;
        let { pathname, push } = Router;
        push({ pathname: backUrl(pathname), query: { mes: cronograma.mes, year: cronograma.year } });
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value });
    }

    handlePage = async (nextPage) => {
        await this.setState({ page: nextPage })
        await this.getSentEmail(true);
    }

    getSentEmail = async (changed = true) => {
        this.props.fireLoading(true);
        let { query } = this.props;
        let { page, query_search, send_email } = this.state;
        let id = query.id ? atob(query.id) : '__error';
        this.setState({ loading: true });
        await unujobs.get(`cronograma/${id}/sent_email?page=${page}&query_search=${query_search}&send_email=${send_email}`)
        .then(res => {
            let { cronograma, enviados, no_enviados, historial } = res.data;
            // add entity
            this.props.fireEntity({ render: true, disabled: true, entity_id: cronograma.entity_id });
            // datos
            this.setState(state => {
                // add
                state.historial.data = changed ? [...state.historial.data, ...historial.data] : historial.data;
                state.historial.last_page = historial.last_page;
                state.historial.total = historial.total;
                // response
                return {
                    cronograma,
                    enviados, 
                    no_enviados,
                    historial: state.historial
                }
            });
        })
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
        this.props.fireLoading(false);
    }

    safe = async () => {
        let answer = await Confirm('warning', `¿Desea enviar correos de las boletas informativas?`)
        if (answer) {
            await this.send();
        }
    }

    send = async () => {
        this.props.fireLoading(true);
        this.setState({ loading: true });
        let { cronograma, errors } = this.state;
        await unujobs.post(`cronograma/${cronograma.id}/send_email`, { errors: JSON.stringify(errors) }, { headers: { CronogramaID: cronograma.id }})
        .then(async res => {
            this.props.fireLoading(false);
            let { success, message, next } = res.data;
            if (!success) throw new Error(message);
            if (next) await this.send();
            else {
                let message = "El envio de correos a terminado correctamente";
                await Swal.fire({ icon: 'success', text: message });
                await this.getSentEmail(false);
            }
        })
        .catch(async err =>{
            this.props.fireLoading(false);
            await Swal.fire({ icon: 'error', text: err.message })
        });
        this.setState({ loading: false });
    }

    render() {

        let { cronograma, loading, historial, enviados, no_enviados } = this.state;
        let { isLoading } = this.props;

        return (
            <Fragment>
                <div className="col-md-12">
                    <Body>
                        <div className="card-header">
                            <BtnBack onClick={this.handleBack}/> 
                            <span className="ml-2">Enviar Correos del Cronograma <b>#{cronograma.id}</b></span>
                        </div>
                    </Body>
                </div>

                <div className="col-md-12">
                    <Body>
                        <Form>
                            <div className="row">
                                <div className="col-md-5 mb-1">
                                    <Form.Field>
                                        <input type="text" 
                                            placeholder="Buscar por: Apellidos y Nombres"
                                            name="query_search"
                                            value={this.state.query_search}
                                            onChange={(e) => this.handleInput(e.target)}
                                            disabled={this.state.block}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-3 mb-1">
                                    <Form.Field>
                                        <Select
                                            placeholder="Select. Filtro"
                                            options={[
                                                { key: "SIN_FILTER", value: "SIN_FILTER", text: "TODOS" },
                                                { key: "NOT_SEND", value: "NOT_SEND", text: "NO ENVIADOS" },
                                                { key: "SEND", value: "SEND", text: "ENVIADOS" }
                                            ]}
                                            name="send_email"
                                            value={this.state.send_email || "SIN_FILTER"}
                                            onChange={(e, obj) => this.handleInput(obj)}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-2 col-12">
                                    <Button color="blue"
                                        fluid
                                        onClick={async (e) => {
                                            await this.setState({ page: 1 });
                                            await this.getSentEmail(false);
                                        }}
                                    >
                                        <i className="fas fa-search"></i> Buscar
                                    </Button>
                                </div>

                                <div className="col-md-12">
                                    <hr/>
                                </div>

                                <div className="col-md-12 mt-4">
                                    <div className="row">
                                        <div className="col-md-4 col-lg-4">
                                            <div className="card">
                                                <div className="card-body">
                                                    <i className="text-primary fas fa-users"></i> Total: {historial.total || 0}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-4 col-lg-4">
                                            <div className="card">
                                                <div className="card-body">
                                                    <i className="text-success fas fa-paper-plane"></i> Enviados: {enviados || 0}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-4 col-lg-4">
                                            <div className="card">
                                                <div className="card-body">
                                                    <i className="text-red fas fa-times"></i> No Enviados: {no_enviados || 0}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr/>
                                </div>

                                <div className="col-md-12 mt-3">
                                    <List divided verticalAlign='middle'>
                                        {historial && historial.data.map((obj, index) => 
                                            <List.Item key={`list-people-${obj.id}`}>
                                                <List.Content floated='right'>
                                                    <Show condicion={obj.send_email}>
                                                        <Button color={'olive'}
                                                            className="mt-1"
                                                            title="Enviado"
                                                        >
                                                            <i className={`fas fa-check`}></i>
                                                        </Button>
                                                    </Show>

                                                    <Show condicion={!obj.send_email}>
                                                        <Button color={obj.person && obj.person.email_contact ? 'olive' : 'red'}
                                                            basic
                                                            className="mt-1"
                                                            title={obj.person && obj.person.email_contact ? 'Posible envio' : 'No se puede enviar'}
                                                        >
                                                            <i className={`fas fa-${obj.person && obj.person.email_contact ? 'paper-plane' : 'times'}`}></i>
                                                        </Button>
                                                    </Show>
                                                </List.Content>
                                                <Image avatar src={obj.person && obj.person.image_images && obj.person.image_images.image_50x50 || '/img/base.png'} 
                                                    style={{ objectFit: 'cover' }}
                                                />
                                                <List.Content>
                                                    <span className="uppercase mt-1">{obj.person && obj.person.fullname}</span>
                                                    <br/>
                                                    <span className="badge badge-dark mt-1 mb-2">
                                                        {obj.cargo} - {obj.type_categoria}
                                                    </span>

                                                    <span className="badge badge-warning ml-1 mt-1 mb-2">
                                                        {obj.person && obj.person.email_contact}
                                                    </span>
                                                </List.Content>
                                            </List.Item>
                                        )}
                                    </List>    
                                </div>

                                <Show condicion={historial.data && !historial.data.length && !loading}>
                                    <div className="col-md-12 text-center pt-5 pb-5">
                                        <h4 className="text-muted">No se encontraron regístros</h4>
                                    </div>
                                </Show>

                                <div className="col-md-12 mt-3">
                                    <Button fluid
                                        onClick={(e) => this.handlePage(this.state.page + 1)}
                                        disabled={historial && historial.last_page == this.state.page  || historial && historial.last_page == 1}
                                    >
                                        Obtener más registros
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </Body>
                </div>

                <BtnFloat theme="btn-success"
                    style={{ right: "40px" }}
                    onClick={this.safe}    
                    disabled={loading}
                >
                    <i className="fas fa-paper-plane"></i> 
                </BtnFloat>
            </Fragment>
        )
    }

}