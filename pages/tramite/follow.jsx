import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Body, BtnBack } from '../../components/Utils';

const Follow = () => {

    return <div className="col-md-12">
        <Body>
            <div className="card-header">
                Seguimiento de Trámite
            </div>
            <div className="card-body">
                <div className="card mb-3">
                    <div className="card-body">
                        <Form>
                            <div className="row">
                                <div className="col-md-5 col-12 mb-1">
                                    <input type="text"
                                        placeholder="Ingrese el código del trámite"
                                    />
                                </div>

                                <div className="col-md-2 col-12">
                                    <Button fluid>
                                        <i className="fas fa-search"></i> Buscar
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>

                <hr/>

                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead>
                                        <tr>
                                            <th colSpan="2" className="text-center">
                                                <i className="fas fa-male"></i> Datos Personales
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><i className="fas fa-passport"></i> Tipo de Documento</td>
                                        </tr>
                                        <tr>
                                            <td><i className="far fa-id-card"></i> Nro de Documento</td>
                                        </tr>
                                        <tr>
                                            <td><i className="far fa-user"></i> Nombres y Apellidos</td>
                                        </tr>
                                        <tr>
                                            <td><i className="fas fa-map-marker-alt"></i> Dirección</td>
                                        </tr>
                                        <tr>
                                            <td><i className="fas fa-inbox"></i> E-Mail</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    
                        <div className="col-md-6">
                            <table className="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th colSpan="2" className="text-center">
                                            <i className="fas fa-file-pdf"></i> Datos del Documento
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><i className="fas fa-passport"></i> Entidad</td>
                                    </tr>
                                    <tr>
                                        <td><i className="fas fa-passport"></i> Tipo Documento</td>
                                    </tr>
                                    <tr>
                                        <td><i className="far fa-file-pdf"></i> Nro Documento</td>
                                    </tr>
                                    <tr>
                                        <td><i className="far fa-comment-dots"></i> Asunto</td>
                                    </tr>
                                    <tr>
                                        <td><i className="far fa-file-alt"></i> Archivo</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Body>
    </div>
}

export default Follow; 