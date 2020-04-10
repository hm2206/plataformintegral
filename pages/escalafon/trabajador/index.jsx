import React, { Component, Fragment } from 'react'
import ReactDOM from 'react-dom';
import { BtnFloat } from '../../../components/Utils';
import Router from 'next/router';
import { AUTHENTICATE } from '../../../services/auth';
import { Button, Form } from 'semantic-ui-react'
import { unujobs } from '../../../services/apis';
import DataTable from '../../../components/datatable';
import btoa from 'btoa';
import Swal from 'sweetalert2';

export default class Index extends Component
{

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        return { pathname: ctx.pathname, query: ctx.query }
    }

    state = {
        loading: false,
        query_search: "",
        works: [],
        total: 0,
        page: 1
    }

    componentDidMount = async () => {
        await this.setState((state, props) => ({
            query_search: props.query.query_search ? props.query.query_search : ""
        }));
        // gets
        this.getWorks();
    }

    componentWillReceiveProps = async (nextProps) => {
        let { props } = this;
        if (nextProps.query.query_search != props.query.query_search) {
            await this.setState({ page: 1, works: [] });
            await this.getWorks();
        }
    }

    handleInput = ({ name, value }, url = false) => {
        this.setState({ [name]: value });
        // link
        if (url) {
            Router.push({ pathname: Router.pathname, query: { [name]: value } });
        }
    }

    handleOption = async (obj, key, index) => {
        let id = await btoa(obj.id);
        if (key == 'info') Router.push({ pathname: `${Router.pathname}/profile`, query: { id } });
    }

    handleActionScroll = async (e, body) => {
        await this.getWorks();
        body.style.overflow = 'auto';
    }

    getWorks = async () => {
        this.setState({ loading: true });
        await unujobs.get(`work?page=${this.state.page}&query_search=${this.state.query_search}`)
        .then(async res => {
            let  { data, total, next_page_url } = res.data;
            await this.setState(state => ({ works: data.length ? [...state.works, ...data] : state.works, total, page: state.page + 1 }));
            // activar o desactivar el scroll
            if (this.state.page != 2 && !next_page_url) {
                await Swal.fire({ icon: "warning", text: "No hay más registros!" });
                this.leaveScroll();
            } 
        })
        .catch(err => console.log());
        this.setState({ loading: false });
    }

    render() {
        return (
            <Form loading={this.state.loading}>
                <div className="col-md-12">
                    <DataTable titulo={<span><i className="fas fa-list"></i> Lista de Trabajadores</span>}
                        headers={["#ID", "Apellidos y Nombres", "N° Documento", "N° Cussp"]}
                        data={this.state.works}
                        index={[
                            { key: "person.id", type: "text" },
                            { key: "person.fullname", type: "text" },
                            { key: "person.document_number", type: "icon" },
                            { key: "numero_de_cussp", type: "icon", bg: 'dark' }
                        ]}
                        options={[
                            { key: "info", icon: "fas fa-info" }
                        ]}
                        getOption={this.handleOption}
                        onScroll={this.handleActionScroll}
                    >
                        <div className="col-md-12 mt-2">
                            <div className="row">
                                <div className="col-md-7">
                                    <Form.Field>
                                        <input type="text" 
                                            placeholder="Buscar trabajador por: Apellidos y Nombres"
                                            name="query_search"
                                            value={this.state.query_search}
                                            onChange={(e) => this.handleInput(e.target)}
                                        />
                                    </Form.Field>
                                </div>

                                <div className="col-xs">
                                    <Button color="blue"
                                        onClick={ async (e) => Router.push({ pathname: Router.pathname, query: { query_search: this.state.query_search } })}
                                    >
                                        <i className="fas fa-search"></i> Buscar
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="card-body mt-4">
                            <h4>Resultados: {this.state.works.length} de {this.state.total}</h4>
                        </div>

                    </DataTable>
                </div>

                <BtnFloat
                    disabled={this.state.loading}
                    onClick={(e) => Router.push({ pathname: `${Router.pathname}/create` })}
                >
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </Form>
        )
    }

}