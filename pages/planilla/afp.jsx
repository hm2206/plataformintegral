import React, {Component} from 'react';
import {Button} from 'react-bootstrap';
import Datatable from '../../components/datatable';
import { authentication } from '../../services/apis';
import axios from 'axios';
import Router from 'next/router';
import btoa from 'btoa';

export default class Afp extends Component {

    constructor(props) {
        super(props);
        this.state = {
            estado: 1,
            private: "",
            page: false,
            loading: false,
            afps: []
        }

        this.handleInput = this.handleInput.bind(this);
        this.getOption = this.getOption.bind(this);
    }

    static getInitialProps(props) {
        let {query, pathname} = props;
        return {query, pathname}
    }

    async componentDidMount() {
        this.getAfps(); // obtener conceptos
    }

    handleInput(e) {
        let {name, value} = e.target;
        this.setState({[name]: value});
    }

    getAfps = async () => {
        this.setState({loading: true});
        let {estado} = this.state;
        await authentication.get(`afp?estado=${estado}`).then(res => {
            let {data} = res.data;
            this.setState({afps: data});
        }).catch(err => console.log(err.message));
        this.setState({loading: false});
    }

    getOption(obj, key, index) {
        let {pathname, query} = Router;
        query[key] = btoa(obj.id);
        Router.push({pathname, query});
    }

    render() {

        let {loading, afps} = this.state;

        return (<div>
            <Datatable titulo="Lista del Sistema de Pensiones"
                isFilter={false}
                loading={loading}
                headers={
                    [
                        "#ID",
                        "Descripcion",
                        "Prima Seg. %",
                        "Aporte Obg. %",
                        "Prima Limite S/.",
                        "Situación",
                        "Estado"
                    ]
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
                            key: "prima",
                            type: "icon",
                            justify: "center"
                        }, {
                            key: "aporte",
                            type: "icon",
                            justify: "center"
                        }, {
                            key: "prima_limite",
                            type: "icon",
                            bg: "dark",
                            justify: "center"
                        }, {
                            key: "private",
                            type: "switch",
                            justify: "center",
                            is_true: "Privado",
                            bg_true: "warning",
                            is_false: "Publico",
                            bg_false: "warning"
                        }, {
                            key: "activo",
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
                data={afps}>
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
                                <option value="1">Sistemas de Pensiones Activos</option>
                                <option value="0">Sistemas de Pensiones Eliminados</option>
                            </select>
                        </div>

                        <div className="col-md-3 mb-1">
                            <select className="form-control" name="private"
                                value={
                                    this.state.private
                                }
                                onChange={
                                    this.handleInput
                            }>
                                <option value="">Select. Condicion del SP.</option>
                                <option value="1">Privados</option>
                                <option value="0">Publicos</option>
                            </select>
                        </div>

                        <div className="col-md-2">
                            <Button onClick={
                                    this.getAfps
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
