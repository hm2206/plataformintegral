import React, {Component, Fragment} from 'react';
import {Button} from 'react-bootstrap';
import Datatable from '../../components/datatable';
import {authentication} from '../../services/apis';
import axios from 'axios';
import Router from 'next/router';
import btoa from 'btoa';
import {BtnFloat} from '../../components/Utils';

export default class Cargo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            page: false,
            loading: false,
            cargos: [],
            estado: 1
        }

        this.handleInput = this.handleInput.bind(this);
        this.getOption = this.getOption.bind(this);
    }

    static getInitialProps(props) {
        let {query, pathname} = props;
        return {query, pathname}
    }

    async componentDidMount() {
        this.getCargos(); // obtener Cargos
    }

    handleInput(e) {
        let {name, value} = e.target;
        this.setState({[name]: value});
    }

    getCargos = async () => {
        this.setState({loading: true});
        let {year, estado} = this.state;
        await authentication.get(`cargo?estado=${estado}`).then(res => {
            let {data} = res.data;
            this.setState({cargos: data});
        }).catch(err => console.log(err.message));
        this.setState({loading: false});
    }

    getOption(obj, key, index) {
        let {pathname, query} = Router;
        query[key] = btoa(obj.id);
        Router.push({pathname, query});
    }

    render() {

        let {loading, cargos} = this.state;

        return (<div>
            <Datatable titulo="Lista de Los Cargos o Particiones Presupuestales"
                isFilter={false}
                loading={loading}
                headers={
                    ["#ID", "Descripcion", "Planilla", "Ext Presupuestal", "Estado"]
                }
                index={
                    [
                        {
                            key: "id",
                            type: "text"
                        }, {
                            key: "descripcion",
                            type: "text"
                        }, {
                            key: "planilla.descripcion",
                            type: "icon"
                        }, {
                            key: "ext_pptto",
                            type: "icon",
                            bg: "dark",
                            justify: "center"
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
                            key: "edit",
                            icon: "fas fa-pencil-alt",
                            title: "Editar Cargo",
                            rules: {
                                key: "activo",
                                value: 1
                            }
                        }, {
                            id: 1,
                            key: "restore",
                            icon: "fas fa-sync",
                            title: "Restaurar Cargo",
                            rules: {
                                key: "activo",
                                value: 0
                            }
                        }, {
                            id: 1,
                            key: "delete",
                            icon: "fas fa-trash-alt",
                            title: "Eliminar Cargo",
                            rules: {
                                key: "activo",
                                value: 1
                            }
                        }
                    ]
                }
                optionAlign="text-center"
                getOption={
                    this.getOption
                }
                data={cargos}>
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
                                <option value="1">Cargos Activos</option>
                                <option value="0">Cargos Eliminados</option>
                            </select>
                        </div>

                        <div className="col-md-2">
                            <Button onClick={
                                    this.getCargos
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
            <BtnFloat/>
        </div>)
    }

}
