import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { Confirm } from '../../services/utils';
import Modal from '../modal'
import Show from '../show';
import { Accordion, Icon } from 'semantic-ui-react';
import AnualPlanTrabajo from './anualPlanTrabajo';
import CierrePlanTrabajo from './cierrePlanTrabajo';
import { Fragment } from 'react';
  

const ReportPlanTrabajo = ({ isClose = null, plan_trabajo = {} }) => {

    // panes
    const Panels = [
        { 
            key: 'ANUAL', 
            title: 'Reporte Anual de Actividades y Gastos Correspondientes al Plan de Trabajo', 
            content : <AnualPlanTrabajo plan_trabajo={plan_trabajo}/> 
        },
        { 
            key: 'FINAL', 
            title: 'Reporte de Informe de Cierre', 
            content: <CierrePlanTrabajo plan_trabajo={plan_trabajo}/>
        },
    ];

    // estados
    const [current_index, setCurrentIndex] = useState(undefined);

    // render
    return (
        <Modal md="12" isClose={isClose} show={true} titulo={<span><i className="fas fa-file-alt"></i> Reporte del Plan de Trabajo</span>}>
            <div className="card-body">
                <Accordion fluid styled>
                    {Panels.map((p, indexP) => 
                        <Fragment key={`${p.key}-${indexP}`}>
                            <Accordion.Title active={current_index === indexP} onClick={(e) => setCurrentIndex(current_index === indexP ? undefined : indexP)}>
                                <Icon name='dropdown' />
                                {p.title}
                            </Accordion.Title>
                            <Accordion.Content active={current_index === indexP}>{p.content}</Accordion.Content>
                        </Fragment>
                    )}
                </Accordion>
            </div>
        </Modal>
    );
}

// exportar
export default ReportPlanTrabajo;