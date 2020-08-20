import React, { Component } from 'react'
import Modal from '../modal';
import atob from 'atob';
import { Button, Form, List, Image } from 'semantic-ui-react';
import Router from 'next/router';
import { tramite } from '../../services/apis';
import Show from '../show';

export default class ModalTracking extends Component
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
        await this.getUser(nextPage, this.state);
    }

    render() {

        let { loader, tracking, query_search } = this.state;
        let { tramite } = this.props;

        return (
            <Modal
                show={true}
                {...this.props}
                titulo={<span><i className="fas fa-path"></i> Seguimiento del Trámite <span className="badge badge-dark">{tramite && tramite.slug}</span></span>}
            >
                <Form className="card-body" loading={loader}>

                    {/* <div className="row justify-content-center pl-4 pr-4">
                        <div className="col-md-10 mb-2 text-left">
                            <Form.Field>
                                <input type="text"
                                    placeholder="Buscar usuario por: email o username"
                                    value={query_search || ""}
                                    name="query_search"
                                    onChange={({ target }) => this.setState({ [target.name]: target.value })}
                                />
                            </Form.Field>
                        </div>

                        <div className="col-md-2">
                            <Button fluid
                                onClick={async (e) => {
                                    await this.getUser(1, this.state, true)
                                }}
                            >
                                <i className="fas fa-search"></i>
                            </Button>
                        </div>
                    </div> */}

                    <div className="pl-4 mt-4 pr-4">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Procedencia</th>
                                    <th>Fecha</th>
                                    <th>Descripción</th>
                                    <th>Archivo</th>
                                </tr>
                            </thead>
                            <tbody>
                                <Show condicion={!loader && !tracking.total}>
                                    <tr>
                                        <td colSpan="4" className="text-center">No hay registros</td>
                                    </tr>
                                </Show>
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="row justify-content-center mt-3">
                        <div className="col-md-12">
                            <hr/>
                        </div>
                        <div className="col-md-12">
                            <Button fluid
                                disabled={loader || tracking.lastPage > tracking.page + 1}
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