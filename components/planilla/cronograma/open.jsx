import React, { Component } from 'react'
import Modal from '../../modal';
import { Button, Form } from 'semantic-ui-react';
import { microPlanilla } from '../../../services/apis';
import Swal from 'sweetalert2';
import Router from 'next/router';

export default class Open extends Component
{

    state = {
        loader: false
    }

    open = async () => {
        this.setState({ loader: true });
        let { cronograma } = this.props;
        await microPlanilla.put(`cronogramas/${cronograma.id}/open`, {}, { headers: { CronogramaID: cronograma.id } })
        .then(async () => {
            await Swal.fire({
                icon: "success",
                text: "El cronograma se abrío correctamente!"
            });
            let { pathname, query, push } = Router;
            this.props.isClose();
            await push({ pathname, query });
            if (typeof this.props.onSave == 'function') this.props.onSave(true);
        })
            .catch(() => Swal.fire({
                icon: 'error',
                text: "No se pudo abrir el cronograma"
            }));
        this.setState({ loader: false });
    }

    render() {
        return (
            <Modal
                show={true}
                {...this.props}
                titulo={<span><i className="fas fa-unlock"></i> Abrir cronograma: #{this.props.cronograma && this.props.cronograma.id}</span>}
            >
                <Form className="card-body" loading={this.state.loader}>
                    <h1 className="text-center mt-5">
                        <i className="fas fa-unlock"></i>
                        <br/>
                        Abrir Cronograma
                    </h1>

                    <div className="row justify-content-center mt-5">
                        <div className="col-md-8 text-left">
                            1.- El cronograma será abierto solo por las personas autorizadas. <br/>
                            2.- Todas las acciones son monitoreadas! <br/>
                        </div>
                    </div>

                    <div className="row justify-content-center mt-3">
                        <div className="col-md-8 text-center mr-4">
                            <Button color="teal"
                                onClick={this.open}
                            >
                                <i className="fas fa-check"></i> Abrir
                            </Button>
                        </div>
                    </div>
                </Form>
            </Modal>
        );
    }

}