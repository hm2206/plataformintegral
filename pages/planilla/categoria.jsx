import React, {Component} from 'react';
import {Button} from 'react-bootstrap';
import Datatable from '../../components/datatable';
import {authentication} from '../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';
import Info from '../../components/cronograma/info';

export default class Categoria extends Component {

    constructor(props) {
        super(props);
        this.state = {
            estado: 1,
            page: false,
            loading: false,
            categorias: []
        }

        this.handleInput = this.handleInput.bind(this);
        this.getOption = this.getOption.bind(this);
    }

    static getInitialProps(props) {
        let {query, pathname} = props;
        return {query, pathname}
    }

    async componentDidMount() {
        this.getCategorias(); // obtener categorias
    }

    handleInput(e) {
        let {name, value} = e.target;
        this.setState({[name]: value});
    }

    getCategorias = async () => {
        this.setState({loading: true});
        let {estado} = this.state;
        await authentication.get(`categoria?estado=${estado}`).then(res => {
            let {data} = res.data;
            this.setState({categorias: data});
        }).catch(err => console.log(err.message));
        this.setState({loading: false});
    }

    getOption(obj, key, index) {
        let {pathname, query} = Router;
        query[key] = btoa(obj.id);
        Router.push({pathname, query});
    }

    render() {

        let {loading, categorias} = this.state;
        let {query, pathname} = this.props;

        return (<div>
            <Datatable titulo="Lista de Categorías Remunerativas"
                isFilter={false}
                loading={loading}
                headers={
                    ["#ID", "Descripcion", "Estado"]
                }
                index={
                    [
                        {
                            key: "id",
                            type: "text"
                        }, {
                            key: "nombre",
                            type: "text"
                        }, {
                            key: "estado",
                            is_true: "Activo",
                            is_false: "Eliminado",
                            type: "switch"
                        }
                    ]
                }
                options={
                    [
                        {
                            id: 1,
                            key: "info",
                            icon: "fas fa-info"
                        }, {
                            id: 2,
                            key: "restore",
                            icon: "fas fa-sync",
                            rules: {
                                key: "estado",
                                value: 0
                            }
                        }, {
                            id: 3,
                            key: "edit",
                            icon: "fas fa-pencil-alt",
                            rules: {
                                key: "estado",
                                value: 1
                            }
                        }, {
                            id: 4,
                            key: "delete",
                            icon: "fas fa-trash-alt",
                            rules: {
                                key: "estado",
                                value: 1
                            }
                        }
                    ]
                }
                getOption={
                    this.getOption
                }
                data={categorias}>
                <div className="form-group">
                    <div className="row">
                        <div className="col-md-4 mb-1">
                            <select className="form-control" name="estado"
                                value={
                                    this.state.estado
                                }
                                onChange={
                                    this.handleInput
                            }>
                                <option value="1">Categorias Activas</option>
                                <option value="0">Categorias Eliminadas</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <Button onClick={
                                    this.getCategorias
                                }
                                disabled={
                                    this.state.loading
                                }
                                className="btn-block">
                                <i className="fas fa-search"></i>
                                <span>
                                    Buscar</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </Datatable>
            {/* componentes de la ventana  */}
            <Info show={
                    query.info
                }
                query={query}
                pathname={pathname}
                close={
                    (e) => {
                        query.info = "";
                        Router.push({pathname, query});
                    }
                }/>
        </div>)
    }

}
