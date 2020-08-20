import React, { Component } from 'react'
import Modal from '../modal';
import atob from 'atob';
import { Button, Form } from 'semantic-ui-react';
import { unujobs } from '../../services/apis';
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
        await unujobs.post(`cronograma/${cronograma.id}/close`, {}, { headers: { CronogramaID: cronograma.id } })
        .then(async res => {
            let { success, message } = res.data;
            let icon = success ? 'success' : 'error';
            await Swal.fire({ icon, text: message });
            let { pathname, query, push } = Router;
            this.props.isClose();
            if (success) push({ pathname, query });
        })
        .catch(err => Swal.fire({ icon: 'error', text: err.message }));
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