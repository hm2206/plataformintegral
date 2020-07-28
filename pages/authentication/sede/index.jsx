import React, { Component, Fragment } from 'react'
import { BtnFloat } from '../../../components/Utils';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Button, Form, Pagination } from 'semantic-ui-react'
import { authentication} from '../../../services/apis';
import DataTable from '../../../components/datatable';
import btoa from 'btoa';
import { responsive } from '../../../services/storage.json';
import { Body } from '../../../components/Utils';
import Show from '../../../components/show';
import { getSede } from '../../../services/requests/sede';

export default class Index extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        query.page = query.page || 1;
        query.query_search = query.query_search || "";
        let { sede, success } = await getSede(ctx);
        return { pathname, query, success, sede };
    }

    state = {
        loading: false,
        query_search: ""
    }

    setting = (props) => {
        this.setState({ query_search: props.query.query_search || "" });
    }

    handleInput = ({ name, value }, url = false) => {
        this.setState({ [name]: value });
    }

    
    handlePage = async (e, { activePage }) => {
        let { pathname, query, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
    }

    handleOption = async (obj, key, index) => {
        this.setState({ loading: true });
        let { query, pathname, push } = Router;
        let id = await btoa(obj.id);
        query.id = id;
        if (key == 'info') push({ pathname: `${pathname}/edit`, query });
    }

    render() {

        let { query, sede } = this.props;

        return (
            <div className="col-md-12">
                <Body>
                    <Form loading={this.state.loading}>
                        <div className="col-md-12">
                            <DataTable titulo={<span>Lista de Sedes</span>}
                                headers={["#ID", "Descripción", "Dirección"]}
                                data={sede && sede.data}
                                index={[
                                    { key: "id", type: "text" },
                                    { key: "descripcion", type: "text", className: "uppercase" },
                                    { key: "direccion", type: "icon" }
                                ]}
                                options={[
                                    { key: "info", icon: "fas fa-info" }
                                ]}
                                getOption={this.handleOption}
                            >
                                <div className="col-md-12 mt-2">
                                    <div className="row">
                                        <div className="col-md-7 mb-1 col-10">
                                            <Form.Field>
                                                <input type="text" 
                                                    placeholder="Buscar trabajador por: Descripció o Dirección"
                                                    name="query_search"
                                                    value={this.state.query_search}
                                                    onChange={(e) => this.handleInput(e.target)}
                                                />
                                            </Form.Field>
                                        </div>

                                        <div className="col-xs col-2">
                                            <Button color="blue"
                                                fluid
                                                onClick={ async (e) => Router.push({ pathname: Router.pathname, query: { query_search: this.state.query_search } })}
                                            >
                                                <i className="fas fa-search"></i> {responsive.md < this.props.screenX ? 'Buscar' : ''}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body mt-4">
                                    <h4>Resultados: {sede && sede.total || 0}</h4>
                                </div>

                            </DataTable>
                            <div className="text-center">
                                <hr/>
                                <Pagination defaultActivePage={query.page || 1} 
                                    totalPages={sede && sede.lastPage || 1}
                                    enabled={this.state.loading}
                                    onPageChange={this.handlePage}
                                />
                            </div>
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