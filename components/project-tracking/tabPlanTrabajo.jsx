import React, { Fragment, useContext, useEffect, useState } from 'react';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { projectTracking } from '../../services/apis';
import { AppContext } from '../../contexts/AppContext';
import Show from '../show';
import AddPlanTrabajo from './addPlanTrabajo';
import Skeleton from 'react-loading-skeleton';
import ItemPlanTrabajo from './itemPlanTrabajo';
import { BtnFloat } from '../Utils';
import { projectTypes } from '../../contexts/project-tracking/ProjectReducer';

const situacions = {
    PENDIENTE: {
        text: "Pendiente/Registrado",
        color: "#263238"
    },
    ENVIADO: {
        text: "Enviado para revisión",
        color: "#0d47a1"
    },
    OBSERVADO: {
        text: "Observado",
        color: "#ff9800"
    },
    APROBADO: {
        text: "Aprobado",
        color: "#66bb6a"
    },
    RESERVA: {
        text: "Aprobado con Reservas",
        color: "#26c6da"
    },
    DESAPROBADO: {
        text: "Desaprobado",
        color: "#d50000"
    }
}

const Placeholder = () => {
    const datos = [1, 2, 3, 4, 5];
    return datos.map(d => 
        <tr>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>  
    );
}

const TabPlanTrabajo = () => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project, plan_trabajos, dispatch } = useContext(ProjectContext);

    // stados
    const [is_create, setIsCreate] = useState(false);
    const [current_loading, setCurrentLoading] = useState(true);

    // obtener plan de trabajo
    const getPlanTrabajo = async (add = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`project/${project.id}/plan_trabajo?page=${plan_trabajos.page || 1}`)
            .then(res => {
                let { data } = res;
                let payload ={
                    total: data.plan_trabajos.total,
                    lastPage: data.plan_trabajos.lastPage,
                    data: add ? [...plan_trabajos.data, ...data.plan_trabajos.data] : data.plan_trabajos.data
                };
                // setting 
                dispatch({ type: projectTypes.SET_PLAN_TRABAJOS, payload });
            })
            .catch(err => {
                let payload = { page: 1, total: 0, last_page: 0, data: [] };
                dispatch({ type: projectTypes.SET_PLAN_TRABAJOS, payload });
            });
        setCurrentLoading(false);
    }

    // primera carga
    useEffect(() => {
        if (project.id) getPlanTrabajo();
    }, [project.id]);

    // render
    return (
        <Fragment>
            <div className="table-responsive font-13">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th className="text-center">Duración</th>
                            <th className="text-center">Año</th>
                            <th className="text-center">N° Resolución</th>
                            <th className="text-center">F. Resolución</th>
                            <th className="text-center">Costo</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <Show condicion={!current_loading}
                            predeterminado={<Placeholder/>}
                        >
                            {plan_trabajos?.data?.map((plan, indexP) => 
                                <ItemPlanTrabajo 
                                    key={`th-plan-trabajo-${indexP}`}
                                    plan_trabajo={plan}
                                />
                            )}
                            {/* no hay regístros */}
                            <Show condicion={!plan_trabajos?.total}>
                                <tr>
                                    <td colSpan="7" className="text-center">No hay registros disponibles</td>
                                </tr>
                            </Show>

                        </Show>
                    </tbody>
                </table>
            </div>

            {/* <div className="mt-5">
                <b className="font-13"><u>Situación del Informe</u></b>
                <div className="font-12">
                    <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['PENDIENTE'].color }}></div> {situacions['PENDIENTE'].text}</div>
                    <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['ENVIADO'].color }}></div> {situacions['ENVIADO'].text}</div>
                    <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['OBSERVADO'].color }}></div> {situacions['OBSERVADO'].text}</div>
                    <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['APROBADO'].color }}></div> {situacions['APROBADO'].text}</div>
                    <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['RESERVA'].color }}></div> {situacions['RESERVA'].text}</div>
                    <div><div style={{ width: "10px", display: "inline-block", height: "10px", background: situacions['DESAPROBADO'].color }}></div> {situacions['DESAPROBADO'].text}</div>
                </div>
            </div> */}
            {/* crear plan de trabajo */}
            <Show condicion={project.state != 'OVER'}>
                <BtnFloat onClick={() => setIsCreate(true)}>
                    <i className="fas fa-plus"></i>
                </BtnFloat>

                <Show condicion={is_create}>
                    <AddPlanTrabajo isClose={(e) => setIsCreate(false)}
                        onSave={(e) => setIsCreate(false)}
                    />
                </Show>
            </Show>
        </Fragment>
    )
}

export default TabPlanTrabajo;