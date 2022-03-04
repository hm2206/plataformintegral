import React, { Component } from 'react'
import Modal from '../../modal';
import { Button, Form } from 'semantic-ui-react';
import { microPlanilla } from '../../../services/apis';
import Swal from 'sweetalert2';
import Router from 'next/router';

export default class Close extends Component
{

    state = {
        loader: false,
    }

    close = async () => {
        this.setState({ loader: true });
        let { cronograma } = this.props;
        await microPlanilla.put(`cronogramas/${cronograma.id}/close`, {}, { headers: { CronogramaID: cronograma.id } })
        .then(async () => {
            await Swal.fire({
                icon: "success",
                text: "El cronograma se cerró correctamente!"
            });
            let { pathname, query, push } = Router;
            this.props.isClose();
            push({ pathname, query });
        })
            .catch(() => Swal.fire({
                icon: 'error',
                ext: "No se pudó cerrar el cronograma!"
            }));
        this.setState({ loader: false });
    }

    render() {
        return (
            <Modal
                show={true}
                {...this.props}
                titulo={<span><i className="fas fa-lock"></i> Cerrar cronograma: #{this.props.cronograma && this.props.cronograma.id}</span>}
            >
                <Form className="card-body" loading={this.state.loader}>
                    <h1 className="text-center mt-5">
                        <i className="fas fa-lock"></i>
                        <br/>
                        Cerrar Cronograma
                    </h1>

                    <div className="row justify-content-center mt-5">
                        <div className="col-md-8 text-left">
                            1.- El cronograma será cerrardo solo por las personas autorizadas. <br/>
                            2.- Todas las acciones son monitoreadas! <br/>
                        </div>
                    </div>

                    <div className="row justify-content-center mt-3">
                        <div className="col-md-8 text-center mr-4">
                            <Button color="red"
                                onClick={this.close}
                            >
                                <i className="fas fa-check"></i> Cerrar
                            </Button>
                        </div>
                    </div>
                </Form>
            </Modal>
        );
    }

}