import React, {Component, Fragment} from 'react';
import {Button, Form} from 'semantic-ui-react';
import Datatable from '../../../components/datatable';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat, Body} from '../../../components/Utils';
import { AUTHENTICATE, AUTH } from '../../../services/auth';
import { pageTypeCategoria } from '../../../storage/actions/typeCategoriaActions';
import { Pagination } from 'semantic-ui-react';
import Show from '../../../components/show';

export default class TypeDescuento extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: false,
            loading: false,
            estado: "1"
        }

        this.getOption = this.getOption.bind(this);
    }

    static getInitialProps = async (ctx) => {
        await AUTHENTICATE(ctx);
        let {query, pathname, store} = ctx;
        query.page = query.page ? query.page : 1;
        await store.dispatch(pageTypeCategoria(ctx));
        let { page_type_categoria } = store.getState().type_categoria;
        return {query, pathname, page_type_categoria}
    }

    componentWillReceiveProps = (nextProps) => {
        this.setState({ loading: false });
    }

    handleInput = ({ name, value }) => {
        this.setState({ [name]: value })
    }

    getOption(obj, key, index) {
        let {pathname, query} = Router;
        query[key] = btoa(obj.id);
        Router.push({pathname, query});
    }

    handleSearch = () => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.estado = this.state.estado;
        push({ pathname, query });
    }

    handlePage = async (e, { activePage }) => {
        this.setState({ loading: true });
        let { pathname, query, push } = Router;
        query.page = activePage;
        await push({ pathname, query });
        this.setState({ loading: false });
    }

    render() {

        let {loading} = this.state;
        let { page_type_categoria, query } = this.props;

        return (
                <Form className="col-md-12">
                    <Body>
                        <Datatable titulo="Lista de Tip. Categoría"
                        isFilter={false}
                        loading={loading}
                        headers={
                            ["#ID", "Descripción", "Estado"]
                        }
                        index={
                            [
                                {
                                    key: "id",
                                    type: "text"
                                }, 
                                {
                                    key: "descripcion",
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
                                    title: "Editar Cargo",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }, {
                                    id: 1,
                                    key: "restore",
                                    icon: "fas fa-sync",
                                    title: "Restaurar Cargo",
                                    rules: {
                                        key: "estado",
                                        value: 0
                                    }
                                }, {
                                    id: 1,
                                    key: "delete",
                                    icon: "fas fa-trash-alt",
                                    title: "Eliminar Cargo",
                                    rules: {
                                        key: "estado",
                                        value: 1
                                    }
                                }
                            ]
                        }
                        optionAlign="text-center"
                        getOption={this.getOption}
                        data={page_type_categoria.data}
                    />
                        
                    <div className="text-center">
                        <Show condicion={page_type_categoria && page_type_categoria.data.length > 0}>
                            <hr/>
                            <Pagination defaultActivePage={query.page} 
                                totalPages={page_type_categoria.last_page}
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
