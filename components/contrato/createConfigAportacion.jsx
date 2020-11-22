import React, { useState } from 'react';
import Modal from '../modal';
import { Form } from 'semantic-ui-react';

const CreateConfigAportacion = () => {
    return <Modal show={true}
        titulo={<span><i className="fas fa-coins"></i>Agregar Aportación Empleador</span>}
    >
        <div className="card-body">
            <Form>
                <div className="row">
                    <div className="col-md-6">
                        <label></label>
                    </div>
                </div>
            </Form>
        </div>
    </Modal>;
}

export default CreateConfigAportacion;