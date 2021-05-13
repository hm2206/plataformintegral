import React from 'react';
import Modal from '../modal'
import Show from '../show';
import AnualPlanTrabajo from './anualPlanTrabajo';
import CierrePlanTrabajo from './cierrePlanTrabajo';
import { Fragment } from 'react';
  

const ReportPlanTrabajo = ({ isClose = null, plan_trabajo = {} }) => {

    // render
    return (
        <Modal md="12" isClose={isClose} show={true} titulo={<span><i className="fas fa-file-alt"></i> Reporte Anual del Plan de Trabajo</span>}>
            <div className="card-body">
                <AnualPlanTrabajo plan_trabajo={plan_trabajo}/> 
            </div>
        </Modal>
    );
}

// exportar
export default ReportPlanTrabajo;