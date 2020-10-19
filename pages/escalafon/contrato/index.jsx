import React, { Component } from 'react';
import { Button, Form, Select, Pagination } from 'semantic-ui-react';
import { allInfo } from '../../../storage/actions/infoActions';
import { AUTHENTICATE } from '../../../services/auth';
import DataTable from '../../../components/datatable';
import { BtnFloat } from '../../../components/Utils';
import Router from 'next/router';
import btoa from 'btoa';
import { responsive } from '../../../services/storage.json';
import { Body } from '../../../components/Utils';
import Show from '../../../components/show';

export default class Contrato extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname, store } = ctx;
        query.page = query.page ? query.page : 1;
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

    componentDidMount = async () => {
        this.props.fireEntity({ render: true });
        this.props.fireLoading(true);
        await this.setting(this.props);
        this.props.fireLoading(false);
    }

    setting = (props) => {
        let { infos, query } = props;
        this.setState({ 
            infos: infos.data,
            total: infos.total,
            loading: false,
            query_search: query.query_search,
            estado: query.estado
        });
        // setting scrolling
        window.scrollTo(0, 0);
    }

    handleOption = (obj, key, index) => {
        let { pathname, push, query } = Router;
        let id = btoa(obj.id);
        if (key == 'pay') {
            query.id = id;
            query.clickb = 'Info';
            push({ pathname: `${pathname}/pay`, query });
        } 
    }

    handleInput = ({ name, value }) => {
        this.setState({[name]: value});
    }

    handleSearch = async (e) => {
        Router.push({ 
            pathname: Router.pathname, 
            query: { 
                query_search: this.state.query_search,
                estado: this.state.estado,
                page: 1
            } 
        })
    }

    handlePage = async (e, { activePage }) => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.page = activePage;
        query.estado = this.state.estado;
        await push({ pathname, query });
        this.setState({ loading: false });
    }

    render() {

        let { query, infos } = this.props;

        return (
            <div className="col-md-12">
                <Body>
                    <Form loading={this.state.loading}>
                        <div className="col-md-12">
                            <DataTable titulo={<span>Lista de Contratos</span>}
                                headers={["#ID", "Apellidos y Nombres", "F. Ingreso", "Plaza", "P.A.P", "Estado"]}
                                data={infos.data || []}
                                index={[
                                    { key: "id", type: "text" },
                                    { key: "person.fullname", type: "text" },
                                    { key: "fecha_de_ingreso", type: "date", bg: "warning" },
                                    { key: "plaza", type: "icon" },
                                    { key: "pap", type: "icon", bg: "dark" },
                                    { key: "estado", type: "switch", is_true: "Activo", is_false: "Terminado"}
                                ]}
                                options={[
                                    { key: "pay", icon: "fas fa-coins" }
                                ]}
                                getOption={this.handleOption}
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
                                                        { key: 'deshabilitado', value: "0", text: 'Contratos Terminados'},
                                                        { key: 'anulados', value: "2", text: 'Contratos Anulados'}
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
                                    <h4>Resultados: {infos && infos.data.length * infos.current_page || 0} de {infos && infos.total}</h4>
                                </div>

                            </DataTable>
                            <div className="text-center">
                                <Show condicion={infos && infos.data && infos.data.length > 0}>
                                    <hr/>
                                    <Pagination defaultActivePage={query.page} 
                                        totalPages={infos.last_page}
                                        enabled={this.state.loading}
                                        onPageChange={this.handlePage}
                                    />
                                </Show>
                            </div>
                        </div>

                        <BtnFloat
                            disabled={this.state.loading}
                            onClick={(e) => Router.push({ pathname: `${Router.pathname}/register` })}
                        >
                            <i className="fas fa-plus"></i>
                        </BtnFloat>
                    </Form>
                </Body>
            </div>
        )
    }

}