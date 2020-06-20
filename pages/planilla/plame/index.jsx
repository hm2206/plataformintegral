import React, { Component } from 'react';
import { Body } from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { unujobs } from '../../../services/apis';
import { InputCredencias } from '../../../services/utils';
import { Form, Button } from 'semantic-ui-react';
import Show from '../../../components/show';


export default class Plame extends Component 
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let auth_token = await AUTH(ctx);
        let { pathname, query } = ctx;
        return { pathname, query, auth_token }
    }

    state = {
        year: 2020,
        mes: 6,
        loading: false,
        message: "",
        success: false
    }

    componentDidMount = async () => {
        await this.setState({
            year: new Date().getFullYear(),
            mes: new Date().getMonth() + 1
        });
        // obtener plame
        await this.getPlame();
    }

    handleInput = ({name, value}) => {
        this.setState({ [name]: value });
    }

    getPlame = async () => {
        this.setState({ loading: true });
        let { year, mes } = this.state;
        await unujobs.get(`plame/${year}/${mes}`)
        .then(res => {
            let { success, message } = res.data;
            this.setState({ success, message });
        }).catch(err => console.log(err.message));
        this.setState({ loading: false })
    }

    handleClick = (url) => {
        let form = document.createElement('form');
        document.body.appendChild(form);
        // add credenciales
        InputCredencias().filter(i => form.appendChild(i));
        // add token 
        let token = document.createElement('input');
        token.name = 'auth_token'
        token.value = this.props.auth_token;
        form.appendChild(token);
        // config form
        form.method = 'POST'
        form.action = `${unujobs.path}/${url}`;
        form.target = '_blank'
        form.submit();
    }

    render() {

        return (
            <div className="col-md-12">
                <Body>
                    <Form loading={this.state.loading}>
                        <div className="card-header">
                            <b>Reporte PDT-PLAME</b>
                        </div>

                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3 mb-1 col-6">
                                    <Form.Field>
                                        <input type="number" 
                                            name="year"
                                            value={this.state.year}
                                            onChange={(e) => this.handleInput(e.target)}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-3 mb-1 col-6">
                                    <Form.Field>
                                        <input type="number" 
                                            name="mes"
                                            value={this.state.mes}
                                            onChange={(e) => this.handleInput(e.target)}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-md-2 mb-1 col-12 mt-1">
                                    <Button
                                        fluid
                                        color="blue"
                                        onClick={(e) => this.getPlame()}
                                    >
                                        <i className="fas fa-search"></i> Buscar
                                    </Button>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12 mb-5">
                                    <hr/>
                                </div>

                                <Show condicion={!this.state.success}>
                                    <div className="col-md-12 mt-5">
                                        <h3 className="text-center">
                                            <i className="fas fa-file-alt mb-2" style={{ fontSize: '3em' }}></i>
                                            <br/>
                                            {this.state.message}
                                        </h3>
                                    </div>
                                </Show>

                                <Show condicion={this.state.success}>
                                    <div className="col-md-12 mb-1">
                                        <div className="row">
                                            <div className="col-md-3">
                                                <div 
                                                    className="card card-body text-primary"
                                                    style={{ cursor: 'pointer'  }}
                                                    onClick={(e) => this.handleClick(`pdf/plame/${this.state.year}/${this.state.mes}`)}
                                                >
                                                    <span><i className="fas fa-users mr-1"></i> Reporte PLAME</span>
                                                </div>
                                            </div>

                                            <div className="col-md-3">
                                                <div
                                                    className="card card-body text-success"
                                                    style={{ cursor: 'pointer'  }}
                                                    onClick={(e) => this.handleClick(`plame/jor/${this.state.year}/${this.state.mes}?download=1`)}
                                                >
                                                    <span><i className="fas fa-file-alt mr-1"></i> Generar JOR</span>
                                                </div>
                                            </div>

                                            <div className="col-md-3">
                                                <div 
                                                    className="card card-body text-dark"
                                                    style={{ cursor: 'pointer'  }}
                                                    onClick={(e) => this.handleClick(`plame/rem/${this.state.year}/${this.state.mes}?download=1`)}
                                                >
                                                    <span><i className="fas fa-file-alt mr-1"></i> Generar REM</span>
                                                </div>
                                            </div>

                                            <div className="col-md-3">
                                                <div
                                                    className="card card-body text-red"
                                                    style={{ cursor: 'pointer'  }}
                                                    onClick={(e) => this.handleClick(`plame/rem/${this.state.year}/${this.state.mes}?download=1&extension=pen`)}
                                                >
                                                    <span><i className="fas fa-file-alt mr-1"></i> Generar PEN</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Show>
                            </div>
                        </div>
                    </Form>
                </Body>
            </div>
        )
    }

}