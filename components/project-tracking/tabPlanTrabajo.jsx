import React, { Fragment, useContext, useEffect, useState } from 'react';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { projectTracking } from '../../services/apis';
import moment from 'moment';
import Show from '../show';

const TabPlanTrabajo = () => {

    const { project } = useContext(ProjectContext);

    // stados
    const [current_loading, setCurrentLoading] = useState(true);
    const [plan_trabajo, setPlanTrabajo] = useState({ page: 1, lastPage: 0, data: [] });

    // obtener plan de trabajo
    const getPlanTrabajo = async () => {
        setCurrentLoading(true);
        await projectTracking.get(`project/${project.id}/plan_trabajo?page=${plan_trabajo.page || 1}`)
            .then(res => {
                let { plan_trabajos } = res.data;
                setPlanTrabajo({
                    page: plan_trabajos.page,
                    lastPage: plan_trabajos.lastPage,
                    data: plan_trabajos.data
                });
            })
            .catch(err => console.log(err.message));
        setCurrentLoading(false);
    }

    // primera carga
    useEffect(() => {
        if (project.id) getPlanTrabajo();
    }, [project.id]);

    // render
    return (
    <Fragment>
        <div className="table-responsive">
            <table className="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th className="text-center" rowSpan="2">Duración</th>
                        <th className="text-center" colSpan="2">Fechas</th>
                        <th className="text-center" colSpan="3">Informe</th>
                        <th className="text-center" colSpan="2">Reporte</th>
                    </tr>
                    <tr>
                        <th className="text-center">Inicio</th>
                        <th className="text-center">Fin</th>
                        <th className="text-center">Fecha</th>
                        <th className="text-center">Situación</th>
                        <th className="text-center">Documento</th>
                        <th className="text-center">Fecha</th>
                        <th className="text-center">Documento</th>
                    </tr>
                </thead>
                <tbody>
                    {plan_trabajo && plan_trabajo.data.map(pla => 
                        <tr key={`th-plan-trabajo-${pla.id}`}>
                            <td className="text-center">{pla.duration}</td>    
                            <td className="text-center">{moment(pla.date_start).format('DD/MM/YYYY')}</td>  
                            <td className="text-center">{moment(pla.date_over).format('DD/MM/YYYY')}</td> 
                            <td className="text-center"></td> 
                            <td className="text-center"></td> 
                            <td className="text-center"></td> 
                            <td className="text-center"></td> 
                            <td className="text-center"></td> 
                        </tr>
                    )}
                    <Show condicion={!current_loading && plan_trabajo.data && !plan_trabajo.data.length}>
                        <tr>
                            <td colSpan="8" className="text-center">No hay registros disponibles</td>
                        </tr>
                    </Show>
                </tbody>
            </table>
        </div>
    </Fragment>)
}

export default TabPlanTrabajo;