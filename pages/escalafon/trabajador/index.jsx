import React, { Component, Fragment } from 'react'
import { BtnFloat } from '../../../components/Utils';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Button, Form, Pagination } from 'semantic-ui-react'
import { unujobs } from '../../../services/apis';
import DataTable from '../../../components/datatable';
import btoa from 'btoa';
import { responsive } from '../../../services/storage.json';
import { Body } from '../../../components/Utils';
import { pageWork } from '../../../storage/actions/workActions';
import Show from '../../../components/show';

export default class IndexPerson extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let { pathname, query } = ctx;
        query.page = query.page || 1;
        query.query_search = query.query_search || "";
        await ctx.store.dispatch(pageWork(ctx));
        let { page_work } = ctx.store.getState().work;
        return { pathname, query, page_work };
    }

    state = {
        loading: false,
        query_search: ""
    }

    componentDidMount = async () => {
        this.setting(this.props);
    }

    componentWillReceiveProps = async (nextProps) => {
       if (nextProps.query || this.props.query) this.setting(nextProps);
    }

    setting = (props) => {
        this.setState({ query_search: props.query.query_search || "" });
    }

    handleInput = ({ name, value }, url = false) => {
        this.setState({ [name]: value });
    }

    
    handlePage = async (e, { activePage }) => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
        this.setState({ loading: false });
    }

    handleOption = async (obj, key, index) => {
        this.setState({ loading: true });
        let { query, pathname, push } = Router;
        let id = await btoa(obj.id);
        query.id = id;
        if (key == 'info') push({ pathname: `${pathname}/profile`, query });
    }

    render() {

        let { page_work, query } = this.props || {};

        return (
            <div className="col-md-12">
                <Body>
                    <Form loading={this.state.loading}>
                        <div className="col-md-12">
                            <DataTable titulo={<span>Lista de Trabajadores</span>}
                                headers={["#ID", "Imagen", "Apellidos y Nombres", "N° Documento", "N° Cussp"]}
                                data={page_work && page_work.data}
                                index={[
                                    { key: "person.id", type: "text" },
                                    { key: "person.image_images.image_50x50", type: 'cover' },
                                    { key: "person.fullname", type: "text", className: "uppercase" },
                                    { key: "person.document_number", type: "icon" },
                                    { key: "numero_de_cussp", type: "icon", bg: 'dark' }
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
                                                    placeholder="Buscar trabajador por: Apellidos y Nombres"
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
                                    <h4>Resultados: {page_work && page_work.total || 0}</h4>
                                </div>

                            </DataTable>
                            <div className="text-center">
                                <Show condicion={page_work&& page_work.data && page_work.data.length > 0}>
                                    <hr/>
                                    <Pagination defaultActivePage={query.page} 
                                        totalPages={page_work.last_page || 0}
                                        enabled={this.state.loading}
                                        onPageChange={this.handlePage}
                                    />
                                </Show>
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