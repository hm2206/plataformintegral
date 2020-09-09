import React, { Component } from 'react'
import Modal from '../modal';
import atob from 'atob';
import { Button, Form, Dropdown } from 'semantic-ui-react';
import Router from 'next/router';
import { tramite } from '../../services/apis';
import Show from '../show';
import ModalFiles from './modalFiles';
import ModalNextTracking from './modalNextTracking';
import moment from 'moment';


export default class ModalSend extends Component
{

    state = {
        loader: false,
        block: true,
        tracking: {
            total: 0,
            page: 1,
            lastPage: 1,
            data: []
        },
        query_search: "",
        view_file: {
            show: false,
            origen: [],
            tracking: []
        },
        option: {
            key: "",
            tracking: {}
        },
        config: {}
    }

    componentDidMount = async () => {
        await this.getConfig();
        this.getSend();
    }

    handlePage = async (nextPage) => {
        this.setState({ loader: true });
    }

    handleInput = async ({ name, value }) => {
        this.setState({ [name]: value, block: false });   
    }

    getSend = async (page = 1, up = false) => {
        let { query } = this.props;
        let { query_search } = this.state;
        this.setState({ loader: true });
        await tramite.get(`tracking?status=ENVIADO&page=${page}&query_search=${query_search}`, { headers: { DependenciaId: query.dependencia_id } })
            .then(res => {
                let { success, message, tracking } = res.data;
                if (!success) throw new Error(message);
                this.setState(state => {
                    state.tracking.page = tracking.page;
                    state.tracking.total = tracking.total;
                    state.tracking.lastPage = tracking.lastPage;
                    state.tracking.data = up ? [...state.tracking.data, ...tracking.data] : tracking.data;
                    return { tracking: state.tracking }
                });
            }).catch(err => console.log(err.message));
            this.setState({ loader: false, block: true });
    }

    getConfig = async () => {
        await tramite.get(`config/ENVIADO?variable=NEXT`)
            .then(res  => {
                let { success, message, config } = res.data;
                if (!success) throw new Error(message);
                this.setState({ config });
            }).catch(err => console.log());
    }

    openFiles = async (tracking) => {
        this.setState((state, props) => {
            state.view_file.show = true;
            state.view_file.origen = tracking.tramite_files;
            state.view_file.tracking = tracking.files;
            return { view_file: state.view_file }
        }); 
    }

    getOption = (obj, key, index) => {
        this.setState(state => {
            state.option.key = key;
            state.option.tracking = obj;
            return { option: state.option };
        });
    }

    render() {

        let { loader, tracking, view_file, option, config } = this.state;
        let { tramite, onAction } = this.props;

        return (
            <Modal
                show={true}
                md="12"
                {...this.props}
                isClose={(e) => this.props.isClose(true)}
                titulo={<span><i className="fas fa-path"></i>Buzón de Entrada <span className="badge badge-dark">{tramite && tramite.slug}</span></span>}
            >
                <Form className="card-body" loading={loader}>

                    <div className="col-md-12">
                        <b><i className="fas fa-bell"></i> Entradas <b className="badge badge-warning">{tracking.total}</b></b>
                    </div>

                    <div className="pl-4 pr-4">
                        <hr/>
                        <div className="table-res">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>N° Seguimiento</th>
                                        <th>Tip. Trámite</th>
                                        <th>Asunto</th>
                                        <th>Origen</th>
                                        <th>Fecha</th>
                                        <th>Más datos</th>
                                        <th>Archivos</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <Show condicion={!loader && !tracking.total}>
                                        <tr>
                                            <td colSpan="8" className="text-center">No hay registros</td>
                                        </tr>
                                    </Show>
                                    {/* tracking */}
                                    {tracking.data && tracking.data.map((tra, indexT) => 
                                        <tr key={`tracking-show-enviado-${tra.id}`} 
                                            className={config && config.value < (indexT + 1) ? 'text-muted bg-disabled' : ''}
                                        >
                                            <td>{tra.slug}</td>
                                            <td>{tra.description}</td>
                                            <td>{tra.asunto}</td>
                                            <td>{tra.dependencia_origen && `${tra.dependencia_origen.nombre}`.toUpperCase()}</td>
                                            <td>
                                                <b className="badge badge-red">
                                                    {moment(tra.updated_at).format('DD/MM/YYYY')} <br/>
                                                    {moment(tra.updated_at).format('h:mm a')}
                                                </b>
                                            </td>
                                            <td>
                                                <button className="btn btn-dark" 
                                                    onClick={(e) => typeof onAction == 'function' ? onAction(tra, "INFO", indexT) : null}
                                                >
                                                    <i class="fas fa-info"></i>
                                                </button>
                                            </td>
                                            <td>
                                                <button className="btn btn-dark" 
                                                    onClick={(e) => this.openFiles(tra)}
                                                >
                                                    <i class="far fa-file-alt"></i>
                                                </button>
                                            </td>
                                            <td>
                                                <div className="btn-group">
                                                    <button className="btn btn-dark" 
                                                        onClick={(e) =>  this.getOption(tra, "NEXT", indexT)}
                                                        disabled={config && config.value < (indexT + 1)}
                                                    >
                                                        <i class="fas fa-arrow-alt-circle-right"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>    
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="row justify-content-center mt-3">
                        <div className="col-md-12">
                            <hr/>
                        </div>
                        <div className="col-md-12">
                            <Button fluid
                                disabled={loader || !(tracking.lastPage > tracking.page + 1)}
                                onClick={(e) => this.handlePage(tracking.page + 1)}
                            >
                                Obtener más registros
                            </Button>
                        </div>
                    </div>


                    <Show condicion={option.key == 'NEXT'}>
                        <ModalNextTracking tramite={option.tracking}
                            isClose={(e) => {
                                this.getOption({}, "");
                                if (e) this.getSend();
                            }}
                            entity_id={this.props.entity_id || ""}
                        />
                    </Show>

                    <Show condicion={view_file.show}>
                        <ModalFiles 
                            origen={view_file.origen} 
                            tracking={view_file.tracking}
                            isClose={(e) => this.setState(state => {
                                state.view_file.show = false;
                                return { view_file: state.view_file }
                            })}
                        />
                    </Show>
                </Form>
            </Modal>
        );
    }

}