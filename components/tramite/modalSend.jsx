import React, { Component } from 'react'
import Modal from '../modal';
import atob from 'atob';
import { Button, Form, Dropdown } from 'semantic-ui-react';
import Router from 'next/router';
import { tramite } from '../../services/apis';
import Show from '../show';


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
        query_search: ""
        
    }

    componentDidMount = async () => {
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

    render() {

        let { loader, tracking } = this.state;
        let { tramite, onAction } = this.props;

        return (
            <Modal
                show={true}
                md="12"
                {...this.props}
                titulo={<span><i className="fas fa-path"></i>Buzón de Entrada <span className="badge badge-dark">{tramite && tramite.slug}</span></span>}
            >
                <Form className="card-body" loading={loader}>

                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-md-4 mb-2">
                                <Form.Field>
                                    <input type="text"
                                        name="query_search"
                                        placeholder="Buscar por codígo del trámite"
                                        onChange={(e) => this.handleInput(e.target)}
                                        value={this.state.query_search || ""}
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-2 mb-2">
                                <Button fluid
                                    disabled={this.state.block}
                                    onClick={(e) => this.getSend(1, false)}
                                >
                                    <i className="fas fa-search"></i> Buscar
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="pl-4 mt-4 pr-4">
                        <hr/>
                        <div className="table-res">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>N° Seguimiento</th>
                                        <th>N° Documento</th>
                                        <th>Tip. Trámite</th>
                                        <th>Remitente</th>
                                        <th>Origen</th>
                                        <th>Archivos</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <Show condicion={!loader && !tracking.total}>
                                        <tr>
                                            <td colSpan="7" className="text-center">No hay registros</td>
                                        </tr>
                                    </Show>
                                    {/* tracking */}
                                    {tracking.data && tracking.data.map((tra, indexT) => 
                                        <tr key={`tracking-show-enviado-${tra.id}`}>
                                            <td>{tra.slug}</td>
                                            <td>{tra.document_number}</td>
                                            <td>{tra.description}</td>
                                            <td>{tra.person && tra.person.fullname}</td>
                                            <td>{tra.dependencia_origen && `${tra.dependencia_origen.nombre}`.toUpperCase()}</td>
                                            <td>
                                                <button className="btn btn-dark" onClick={(e) => typeof onAction == 'function' ? onAction(tra, "NEXT", indexT) : null}>
                                                    <i class="far fa-file-alt"></i>
                                                </button>
                                            </td>
                                            <td>
                                                <div className="btn-group">
                                                    <button className="btn btn-dark" onClick={(e) => typeof onAction == 'function' ? onAction(tra, "NEXT", indexT) : null}>
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
                </Form>
            </Modal>
        );
    }

}