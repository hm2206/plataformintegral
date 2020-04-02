import React, {Component, Fragment} from 'react';
import {Button} from 'react-bootstrap';
import Datatable from '../../../components/datatable';
import {authentication} from '../../../services/apis';
import Router from 'next/router';
import btoa from 'btoa';
import { BtnFloat } from '../../../components/Utils';

export default class Meta extends Component {

    constructor(props) {
        super(props);
        this.state = {
            year: 2019,
            page: false,
            loading: false,
            metas: [],
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
        let date = new Date();
        await this.setState({
            year: date.getFullYear(),
            mes: date.getMonth() == 0 ? 1 : date.getMonth()
        });
        // obtener cronogramas
        this.getMetas();
    }

    handleInput(e) {
        let {name, value} = e.target;
        this.setState({[name]: value});
    }

    getMetas = async () => {
        this.setState({loading: true});
        let {year, estado} = this.state;
        await authentication.get(`meta?year=${year}&estado=${estado}`).then(res => {
            let {data} = res.data;
            this.setState({metas: data});
        }).catch(err => console.log(err.message));
        this.setState({loading: false});
    }

    getOption(obj, key, index) {
        let {pathname, query} = Router;
        query[key] = btoa(obj.id);
        Router.push({pathname, query});
    }

    render() {

        let {loading, metas} = this.state;

        return (<div>
            <Datatable titulo="Lista de las Metas Presupuestales"
                isFilter={false}
                loading={loading}
                headers={
                    ["#ID", "Meta", "ActividadID", "Actividad", "Estado"]
                }
                index={
                    [
                        {
                            key: "metaID",
                            type: "text"
                        }, {
                            key: "meta",
                            type: "text"
                        }, {
                            key: "actividadID",
                            type: "text"
                        }, {
                            key: "actividad",
                            type: "text"
                        }, {
                            key: "estado",
                            type: "switch",
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
                            icon: "fas fa-trash-alt",
                            title: "Eliminar Meta",
                            rules: {
                                key: "estado",
                                value: 1
                            }
                        }
                    ]
                }
                optionAlign="text-center"
                getOption={
                    this.getOption
                }
                data={metas}>
                <div className="form-group">
                    <div className="row">
                        <div className="col-md-2 mb-1">
                            <input type="number" min="2019" className="form-control" placeholder="Año" name="year"
                                value={
                                    this.state.year
                                }
                                disabled={
                                    this.state.loading
                                }
                                onChange={
                                    this.handleInput
                                }/>
                        </div>

                        <div className="col-md-2 mb-1">
                            <select className="form-control" name="estado"
                                value={
                                    this.state.estado
                                }
                                onChange={
                                    this.handleInput
                            }>
                                <option value="1">Activos</option>
                                <option value="0">Eliminados</option>
                            </select>
                        </div>

                        <div className="col-md-2">
                            <Button onClick={
                                    this.getMetas
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
