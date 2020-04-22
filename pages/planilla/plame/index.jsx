import React, { Component } from 'react';
import { Body } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import { unujobs } from '../../../services/apis';
import { Form, Button } from 'semantic-ui-react';
import Show from '../../../components/show';


export default class Plame extends Component 
{

    static getInititalProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query, store } = ctx;
        return { pathname, query }
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

                                <div className="col-md-2 mb-1 col-12">
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
                                        <a href={`${unujobs.path}/pdf/plame/${this.state.year}/${this.state.mes}`} className="ml-2 mr-2" target="_blank">
                                            <i className="fas fa-users mr-1"></i>
                                            Reporte PLAME
                                        </a>

                                        <a href="" className="ml-2 mr-2 text-success" target="_blank">
                                            <i className="fas fa-file-alt mr-1"></i>
                                            Generar JOR
                                        </a>

                                        <a href="" className="ml-2 mr-2 text-dark" target="_blank">
                                            <i className="fas fa-file-alt mr-1"></i>
                                            Generar REM
                                        </a>

                                        <a href="" className="ml-2 mr-2 text-red" target="_blank">
                                            <i className="fas fa-file-alt mr-1"></i>
                                            Generar PEN
                                        </a>
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