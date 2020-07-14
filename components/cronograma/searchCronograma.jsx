import React, { Component } from 'react'
import Modal from '../modal';
import btoa from 'btoa';
import { Button, Form, List } from 'semantic-ui-react';
import { unujobs } from '../../services/apis';
import Show from '../show';
import Router from 'next/router';

export default class SearchCronograma extends Component
{

    state = {
        loader: false,
        year: 2020,
        mes: 6,
        cronograma: {}
    }

    componentDidMount = async () => {
        await this.setting(this.props.cronograma);
        await this.getCronogramas();
    }

    componentWillReceiveProps = (nextProps) => {
        let { cronograma } = this.props;
        if (cronograma != nextProps.cronograma) this.setting(nextProps.cronograma); 
    }

    getCronogramas = async () => {
        this.setState({ loader: true });
        await unujobs.get(`cronograma?year=${this.state.year}&mes=${this.state.mes}`)
        .then(res => this.setState({ cronograma: res.data }))
        .catch(err => console.log(err.message));
        this.setState({ loader: false });
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value });
    }

    setting = (cronograma) => {
        this.setState({
            year: cronograma.year,
            mes: cronograma.mes
        })
    }

    changeCronograma = (id) => {
        let { push, pathname, query } = Router;
        query.id = btoa(id);
        query.search_cronograma = null;
        push({ pathname, query });
    }

    render() {

        let { cronograma } = this.state;

        return (
            <Modal
                show={true}
                {...this.props}
                titulo={<span><i className="fas fa-search"></i> Buscar cronogramas</span>}
            >
                <Form className="card-body" loading={this.state.loader}>
                    <div className="row">
                        <div className="col-md-5 mb-1">
                            <input type="number" 
                                placeholder="Año"
                                name="year"
                                value={this.state.year}
                                onChange={(e) => this.handleInput(e.target)}
                            />
                        </div>

                        <div className="col-md-4 mb-1">
                            <input type="number" 
                                placeholder="Mes"
                                name="mes"
                                value={this.state.mes}
                                onChange={(e) => this.handleInput(e.target)}
                            />
                        </div>

                        <div className="col-md-3">
                            <Button fluid color="blue"
                                onClick={this.getCronogramas}
                            >
                                <i className="fas fa-search"></i>
                            </Button>
                        </div>

                        <div className="col-md-12">
                            <hr/>
                        </div>

                        <div className="col-md-12 mt-3">
                            <List divided verticalAlign='middle'>
                                {cronograma.data && cronograma.data.map(cro => 
                                    <List.Item key={`list-people-${cro.id}`}>
                                        <List.Content floated='right'>
                                            <Button color="black"
                                                onClick={(e) => this.changeCronograma(cro.id)}
                                            >
                                                Ir
                                            </Button>
                                        </List.Content>
                                        <List.Content>
                                            <b>Planilla {cro.planilla && cro.planilla.nombre}</b> 
                                            <Show condicion={cro.adicional}>
                                                <span className="badge badge-primary ml-2">Adicional {cro.adicional}</span> 
                                            </Show>
                                            <span className="badge badge-warning ml-2"><i className="fas fa-user"></i> {cro.historial_count}</span>
                                        </List.Content>
                                    </List.Item>    
                                )}
                            </List>    
                        </div>

                    </div>
                </Form>
            </Modal>
        );
    }

}