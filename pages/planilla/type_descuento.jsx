import React, {Component} from 'react';
import {Button} from 'react-bootstrap';
import Datatable from '../../components/datatable';
import { authentication } from '../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';

export default class Concepto extends Component {

    constructor(props) {
        super(props);
        this.state = {
            estado: 1,
            page: false,
            loading: false,
            type_descuentos: []
        }

        this.handleInput = this.handleInput.bind(this);
        this.getOption = this.getOption.bind(this);
    }

    static getInitialProps(props) {
        let {query, pathname} = props;
        return {query, pathname}
    }

    async componentDidMount() {
        this.getTypeDescuentos(); // obtener type_descuentos
    }

    handleInput(e) {
        let {name, value} = e.target;
        this.setState({[name]: value});
    }

    getTypeDescuentos = async () => {
        this.setState({loading: true});
        let {estado} = this.state;
        await authentication.get(`type_descuento?estado=${estado}`).then(res => {
            let {data} = res.data;
            this.setState({type_descuentos: data});
        }).catch(err => console.log(err.message));
        this.setState({loading: false});
    }

    getOption(obj, key, index) {
        let {pathname, query} = Router;
        query[key] = btoa(obj.id);
        Router.push({pathname, query});
    }

    render() {

        let {loading, type_descuentos} = this.state;

        return (<div>
            <Datatable titulo="Lista de Tipo de Descuentos"
                isFilter={false}
                loading={loading}
                headers={
                    ["#ID", "Descripcion", "Estado"]
                }
                index={
                    [
                        {
                            key: "key",
                            type: "text"
                        }, {
                            key: "descripcion",
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
                data={type_descuentos}>
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
                                <option value="1">Tipo de Descuentos Activos</option>
                                <option value="0">Tipo de Descuentos Eliminados</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <Button onClick={
                                    this.getTypeDescuentos
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
        </div>)
    }

}
