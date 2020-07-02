import React, {Component, Fragment} from 'react';
import {Button, Form, Select} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { pageMeta } from '../../../storage/actions/metaActions';
import { Pagination } from 'semantic-ui-react';
import Show from '../../../components/show';
import { Confirm } from '../../../services/utils';
import { unujobs } from '../../../services/apis';
import Swal from 'sweetalert2';

export default class Meta extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: false,
            loading: false,
            estado: "1",
            year: 2019
        }

        this.getOption = this.getOption.bind(this);
    }

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let {query, pathname, store} = ctx;
        query.page = query.page ? query.page : 1;
        query.year = query.year ? query.year : new Date().getFullYear();
        await store.dispatch(pageMeta(ctx));

        let { page_meta } = store.getState().meta;
        return {query, pathname, page_meta}
    }

    componentDidMount = () => {
        this.setState((state, props) => ({ 
            year: props.query.year,
            estado: props.query.estado
        }))
    }

    componentWillReceiveProps = (nextProps) => {
        this.setState({ loading: false });
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value })
    }

    getOption = async (obj, key, index) => {
        this.setState({ loading: true });
        let {pathname, push} = Router;
        let id = btoa(obj.id);
        switch (key) {
            case 'edit':
                await push({pathname: `${pathname}/${key}`, query: { id }});
                break;
            case 'delete':
                await this.changedState(obj, 0);
                break;
            case 'restore':
                await this.changedState(obj, 1);
                break;
            default:
                break;
        }
        this.setState({ loading: false });
    }

    changedState = async (obj, estado) => {
        let answer = await Confirm("warning", `¿Deseas ${estado ? 'restaurar' : 'desactivar' } la meta "${obj.metaID}"?`)
        if (answer) {
            this.setState({ loading: true });
            await unujobs.post(`meta/${obj.id}/estado`)
            .then(async res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                await Swal.fire({ icon: 'success', text: message });
                await this.handleSearch();
            }).catch(err => Swal.fire({ icon:' error', text: err.message }));
            this.setState({ loading: false });
        }
    }

    handleSearch = () => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.estado = this.state.estado;
        query.year = this.state.year;
        push({ pathname, query });
    }

    handlePage = async (e, { activePage }) => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.page = activePage;
        query.year = this.state.year;
        query.estado = this.state.estado;
        await push({ pathname, query });
        this.setState({ loading: false });
    }

    render() {

        let {loading} = this.state;
        let { page_meta, query } = this.props;

        return (
                <Form className="col-md-12">
                    <Body>
                        <Datatable titulo="Lista de Metas Presupuestales"
                        isFilter={false}
                        loading={loading}
                        headers={
                            ["#metaID", "Descripción", "#actividadID", "Actividad", "Estado"]
                        }
                        index={
                            [
                                {
                                    key: "metaID",
                                    type: "text"
                                }, 
                                {
                                    key: "meta",
                                    type: "text"
                                },
                                {
                                    key: "actividadID",
                                    type: "text"
                                },
                                {
                                    key: "actividad",
                                    type: "text"
                                },
                                {
                                    key: "estado",
                                    type: "switch",
                                    justify: "center",
                                    is_true: "Activo",
                                    is_false: "Eliminado"
                                }
                            ]
                        }
                        options={
                            [
                                {
                                    id: 1,
                                    key: "edit",
                                    icon: "fas fa-pencil-alt",
                                    title: "Editar Meta",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }, {
                                    id: 1,
                                    key: "restore",
                                    icon: "fas fa-sync",
                                    title: "Restaurar Meta",
                                    rules: {
                                        key: "estado",
                                        value: 0
                                    }
                                }, {
                                    id: 1,
                                    key: "delete",
                                    icon: "fas fa-times",
                                    title: "Desactivar Meta",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }
                            ]
                        }
                        optionAlign="text-center"
                        getOption={this.getOption}
                        data={page_meta && page_meta.data}
                    >
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    <Form.Field>
                                        <input type="number" 
                                            name="year"
                                            value={this.state.year}
                                            onChange={(e) => this.handleInput(e.target)}
                                        />
                                    </Form.Field>
                                </div>
                                <div className="col-md-4">
                                    <Form.Field>
                                        <Select
                                            fluid
                                            options={[
                                                {key: "active", value: "1", text: "Activo"},
                                                {key: "des-active", value: "0", text: "Desactivado"}
                                            ]}
                                            name="estado"
                                            value={this.state.estado}
                                            onChange={(e, obj) => this.handleInput(obj)}
                                        />
                                    </Form.Field>
                                </div>
                                <div className="col-md-2">
                                    <Button fluid
                                        color="blue"
                                        onClick={this.handleSearch}
                                    >
                                        <i className="fas fa-search"></i>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Datatable>
                        
                    <div className="text-center">
                        <Show condicion={page_meta && page_meta.data && page_meta.data.length > 0}>
                            <hr/>
                            <Pagination defaultActivePage={query.page} 
                                totalPages={page_meta.last_page}
                                enabled={loading}
                                onPageChange={this.handlePage}
                            />
                        </Show>
                    </div>
                </Body>

                <BtnFloat
                    onClick={async (e) => {
                        await this.setState({ loading: true });
                        let { pathname, push } = Router;
                        push({ pathname: `${pathname}/create` });
                    }}
                >
                    <i className="fas fa-plus"></i>
                </BtnFloat>
            </Form>
        )
    }

}
