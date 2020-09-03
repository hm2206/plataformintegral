import React, { Component } from 'react'
import Modal from '../modal';
import atob from 'atob';
import { Button, Form, List, Image } from 'semantic-ui-react';
import Router from 'next/router';
import { tramite } from '../../services/apis';
import Show from '../show';
import moment from 'moment';
import ModalFiles from './modalFiles';

export default class ModalTracking extends Component
{

    state = {
        view_file: {
            show: false,
            origen: [],
            tracking: []
        },
        loader: false,
        tracking: {
            total: 0,
            page: 1,
            lastPage: 1,
            data: []
        },
        query_search: ""
    }

    componentDidMount = async () => {
        let { tramite } = this.props;
        await this.getTracking(tramite && tramite.slug, 1);
    }

    getTracking = async (slug, page = 1, up = false) => {
        this.setState({ loader: true });
        await tramite.get(`public/tramite/${slug}/tracking?page=${page}`)
        .then(res => {
            let { success, message, tracking } = res.data;
            if (!success) throw new Error(message);
            this.setState(state => {
                state.tracking.total = tracking.total;
                state.tracking.page = tracking.page;
                state.tracking.lastPage = tracking.lastPage;
                state.tracking.data = up ? [...state.tracking.data, ...tracking.data] : tracking.data;
                return { tracking: state.tracking };
            })
        })
        .catch(err => console.log(err.message));
        this.setState({ loader: false });
    }

    handlePage = async (nextPage) => {
        this.setState({ loader: true });
        let { tramite } = this.props;
        await this.getTracking(tramite && tramite.slug, nextPage, true);
    }

    openFiles = async (tracking) => {
        this.setState((state, props) => {
            state.view_file.show = true;
            state.view_file.origen = props.tramite.tramite_files;
            state.view_file.tracking = tracking.files;
            return { view_file: state.view_file }
        }); 
    }
 
    render() {

        let { loader, tracking, view_file } = this.state;
        let { tramite } = this.props;

        return (
            <Modal
                show={true}
                md="12"
                {...this.props}
                titulo={<span><i className="fas fa-path"></i> Seguimiento del Trámite <span className="badge badge-dark">{tramite && tramite.slug}</span></span>}
            >
                <Form className="card-body" loading={loader}>
                    <div className="pl-4 mt-4 pr-4">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Dependencia</th>
                                    <th>Usuario</th>
                                    <th>Fecha</th>
                                    <th>Descripción</th>
                                    <th>Archivo</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <Show condicion={!loader && !tracking.total}>
                                    <tr>
                                        <td colSpan="6" className="text-center">No hay registros</td>
                                    </tr>
                                </Show>
                                {/* tracking */}
                                {tracking.data && tracking.data.map(tra => 
                                    <tr key={`tracking-show-${tra.id}`}>
                                        <td>{tra.dependencia_destino && tra.dependencia_destino.nombre}</td>
                                        <td>{tra.user && tra.user.username}</td>
                                        <td>{moment(tra.created_at).format('DD/MM/YYYY')}</td>
                                        <td>{tra.description}</td>
                                        <td>
                                            <button className="btn btn-dark"
                                                onClick={(e) => this.openFiles(tra)}
                                            >
                                                <i className="far fa-file-alt"></i>
                                            </button>
                                        </td>
                                        <td>{tra.status}</td>
                                    </tr>    
                                )}
                            </tbody>
                        </table>
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
                </Form>
                {/* visualizar files */}
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
            </Modal>
        );
    }

}