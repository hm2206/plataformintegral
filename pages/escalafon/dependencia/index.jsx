import React, { Component } from 'react';
import { Button, Form, Select, Pagination } from 'semantic-ui-react';
import { allDependencias } from '../../../storage/actions/dependenciaActions';
import { AUTHENTICATE } from '../../../services/auth';
import DataTable from '../../../components/datatable';
import { BtnFloat } from '../../../components/Utils';
import Router from 'next/router';
import btoa from 'btoa';
import { responsive } from '../../../services/storage.json';
import { Body } from '../../../components/Utils';
import Show from '../../../components/show';

export default class DependenciaIndex extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { query, pathname, store } = ctx;
        await store.dispatch(allDependencias(ctx));
        let { dependencias } = store.getState(ctx).dependencia;
        return { pathname, query, dependencias }
    }

    state = {
        loading: false,
        query_search: "",
        infos: [],
        total: 0,
        estado: "1"
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
        await this.setState({ loading: true });
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

        let { query, dependencias } = this.props;

        return (
            <div className="col-md-12">
                <Body>
                    <Form loading={this.state.loading}>
                        <div className="col-md-12">
                            <DataTable titulo={<span>Lista de Dependencias/Oficinas</span>}
                                headers={["#ID", "Nombre", "Descripción", "Ubicación"]}
                                data={dependencias}
                                index={[
                                    { key: "id", type: "text" },
                                    { key: "nombre", type: "text" },
                                    { key: "descripcion", type: "text" },
                                    { key: "ubicacion", type: "text" }
                                ]}
                                // options={[
                                //     { key: "pay", icon: "fas fa-coins" }
                                // ]}
                                getOption={this.handleOption}
                            >
                            
                                {/* <div className="card-body mt-4">
                                    <h4>Resultados: {this.state.infos.length} de {this.state.total}</h4>
                                </div> */}

                            </DataTable>
                            {/* <div className="text-center">
                                <Show condicion={infos && infos.data && infos.data.length > 0}>
                                    <hr/>
                                    <Pagination defaultActivePage={query.page} 
                                        totalPages={infos.last_page}
                                        enabled={this.state.loading}
                                        onPageChange={this.handlePage}
                                    />
                                </Show>
                            </div> */}
                        </div>

                        <BtnFloat
                            disabled={this.state.loading}
                            onClick={(e) => Router.push({ pathname: `${Router.pathname}/create` })}
                        >
                            <i className="fas fa-plus"></i>
                        </BtnFloat>
                    </Form>
                </Body>
            </div>
        )
    }

}