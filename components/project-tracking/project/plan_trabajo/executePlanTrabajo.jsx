import React, { useState } from 'react';
import Modal from '../../../modal'
import ItemExecutePlanTrabajo from './itemExecutePlanTrabajo';

const ExecutePlanTrabajo = ({ plan_trabajo, onClose = null }) => {

    // estados
    const [refresh, setRefresh] = useState(false);

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-info-circle"></i> Información Plan de Trabajo</span>}
            md="12"
            height="90vh"
            isClose={onClose}
        >  
            <div className="card-body">
                <div className="row">
                    {/* table */}
                    <div className="col-12">
                        <ItemExecutePlanTrabajo
                            plan_trabajo={plan_trabajo}
                            refresh={refresh}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ExecutePlanTrabajo;