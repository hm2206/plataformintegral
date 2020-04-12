import React, { Component } from 'react';
import { Button, Form, Select } from 'semantic-ui-react';
import { allInfo } from '../../../storage/actions/infoActions';
import { AUTHENTICATE } from '../../../services/auth';
import DataTable from '../../../components/datatable';
import { BtnFloat } from '../../../components/Utils';
import Router from 'next/router';
import { unujobs } from '../../../services/apis';
import btoa from 'btoa';
import { responsive } from '../../../services/storage.json';
import { Body } from '../../../components/Utils';

export default class CreateInfo extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname, store } = ctx;
        query.page = 1;
        query.query_search = query.query_search ? query.query_search : "";
        query.estado = query.estado ? query.estado : `1`;
        await store.dispatch(allInfo(ctx));
        let { infos_paginate } = store.getState(ctx).info;
        return { pathname, query, infos: infos_paginate }
    }

    state = {
        loading: true,
        query_search: "",
        infos: [],
        total: 0,
        estado: "1"
    }

    componentDidMount = () => {
        this.setting(this.props);
    }

    componentWillReceiveProps = (nextProps) => {
        let { query } = this.props;
        if (query.infos != nextProps.infos) {
            this.setting(nextProps);
        } else {
            this.setState({ loading: false });
        }
    }

    setting = (props) => {
        let { infos, query } = props;
        this.setState({ 
            infos: infos.data,
            total: infos.total,
            loading: false,
            page: 1,
            query_search: query.query_search,
            estado: query.estado
        });
        // setting scrolling
        window.scrollTo(0, 0);
    }

    handleScroll = async (evt, body) => {
        await this.getInfos();
        body.style.overflow = 'auto';
    }

    getInfos = async () => {
        await this.setState(state => ({ page: parseInt(state.page) + 1, loading: true }));
        await unujobs.get(`info?page=${this.state.page}&query_search=${this.state.query_search}&estado=${this.state.estado}`)
        .then(res => this.setState(state => ({ infos: state.infos.concat(res.data.data) })))
        .catch(err => console.log(err.message));
        this.setState({ loading: false });
    }

    handleOption = (obj, key, index) => {
        let { pathname, push } = Router;
        let id = btoa(obj.id);
        if (key == 'pay') {
            push({ pathname: `${pathname}/pay`, query: { id, clickb: "Info" } });
        }
    }

    handleInput = ({ name, value }) => {
        this.setState({[name]: value});
    }

    handleSearch = async (e) => {
        await this.setState({ loading: true });
        Router.push({ 
            pathname: Router.pathname, 
            query: { 
                query_search: this.state.query_search,
                estado: this.state.estado
            } 
        })
    }

    render() {
        return (
            <div className="col-md-12">
                <Body>
                    <Form loading={this.state.loading}>
                        <div className="col-md-12">
                            <DataTable titulo={<span><i className="fas fa-list"></i> Lista de Contratos</span>}
                                headers={["#ID", "Apellidos y Nombres", "F. Ingreso", "Plaza", "Perfil Laboral", "Estado"]}
                                data={this.state.infos}
                                index={[
                                    { key: "person.id", type: "text" },
                                    { key: "person.fullname", type: "text" },
                                    { key: "fecha_de_ingreso", type: "icon", bg: "warning" },
                                    { key: "plaza", type: "icon" },
                                    { key: "perfil_laboral", type: "icon", bg: "dark" },
                                    { key: "estado", type: "switch", is_true: "Activo", is_false: "Terminado"}
                                ]}
                                options={[
                                    { key: "pay", icon: "fas fa-coins" },
                                    { key: "report", icon: "fas fa-file-alt" }
                                ]}
                                getOption={this.handleOption}
                                onScroll={this.handleScroll}
                            >
                                <div className="col-md-12 mt-2">
                                    <div className="row">
                                        <div className="col-md-6 col-sm-5 col-12 col-lg-5 mb-1">
                                            <Form.Field>
                                                <input type="text" 
                                                    placeholder="Buscar trabajador por: Apellidos y Nombres, Plaza y Perfil Laboral"
                                                    name="query_search"
                                                    value={this.state.query_search}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-md-3 col-sm-4 col-9 col-lg-3 mb-1">
                                            <Form.Field>
                                                <Select
                                                    placeholder={`Select. Modo de Búsqueda`}
                                                    value={this.state.estado}
                                                    name="estado"
                                                    fluid
                                                    options={[
                                                        { key: 'activo', value: "1", text: 'Contratos Activos'},
                                                        { key: 'deshabilitado', value: "0", text: 'Contratos Terminados'}
                                                    ]}
                                                    onChange={(e, obj) => this.handleInput(obj)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-xs col-sm-3 col-3 col-lg-2 mb-1">
                                            <Button color="blue"
                                                fluid
                                                onClick={this.handleSearch}
                                            >
                                                <i className="fas fa-search"></i> {this.props.sreenX > responsive.md ? 'Buscar' : ''}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body mt-4">
                                    <h4>Resultados: {this.state.infos.length} de {this.state.total}</h4>
                                </div>

                            </DataTable>
                        </div>

                        <BtnFloat
                            disabled={this.state.loading}
                            onClick={(e) => Router.push({ pathname: `${Router.pathname}/preparate` })}
                        >
                            <i className="fas fa-plus"></i>
                        </BtnFloat>
                    </Form>
                </Body>
            </div>
        )
    }

}