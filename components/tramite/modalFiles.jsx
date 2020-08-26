import React, { Component } from 'react'
import Modal from '../modal';
import atob from 'atob';
import { Button, Form, Dropdown } from 'semantic-ui-react';
import Router from 'next/router';
import { tramite } from '../../services/apis';
import Show from '../show';


export default class ModalFiles extends Component
{

    state = {
        loader: false,
        tracking: {
            total: 0,
            page: 1,
            lastPage: 1,
            data: []
        },
        query_search: ""
        
    }

    render() {

        let { loader, tracking } = this.state;
        let { tramite, onAction } = this.props;

        return (
            <Modal
                show={true}
                md="12"
                {...this.props}
                titulo={<span>Archivos</span>}
                classClose="text-white opacity-1"
            >
                <Form className="card-body" loading={loader}>

                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-md-4 mb-2">
                                <Form.Field>
                                    <input type="text"
                                        name="query_search"
                                        placeholder="Buscar por codígo del trámite"
                                    />
                                </Form.Field>
                            </div>

                            <div className="col-md-2 mb-2">
                                <Button fluid>
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
                                                <Show condicion={tra.tramite_files && tra.tramite_files.length}>
                                                    <Dropdown direction="left">
                                                        <Dropdown.Menu direction="left" open={false}>
                                                           {tra.tramite_files.map((f, indexF) => 
                                                                <Dropdown.Item text={`${f}`.split('/').pop()} 
                                                                    key={`file-iten-tracking-${indexF}`}
                                                                />
                                                            )}
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </Show>
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