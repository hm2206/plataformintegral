import React, { useContext, useState, useEffect, Fragment } from 'react';
import { Button, Form } from 'semantic-ui-react';
import Modal from '../modal'
import { AppContext } from '../../contexts/AppContext';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext'
import { projectTracking } from '../../services/apis';
import AddGasto from './addGasto';
import ListGastos from './listGastos';
import Swal from 'sweetalert2';
import Show from '../show';
import currencyFormatter from 'currency-formatter';
import { projectTypes } from '../../contexts/project-tracking/ProjectReducer';
import Skeleton from 'react-loading-skeleton';

const Placeholder = () => {
    const datos = [1, 2, 3, 4, 5, 6];
    return datos.map(d => 
        <tr key={`list-datos-item-placeholder-activity-${d}`}>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>    
    )
}

const ItemActivity = ({ objective, activity, index = 1, active = false, onClick = null }) => {

    // project
    const { project } = useContext(ProjectContext);

    // estados
    const [is_create, setIsCreate] = useState(false);

    // render
    return (
        <Fragment> 
            <tr style={{ background: 'rgba(0, 0, 0, 0.03)' }}>
                <th colSpan="5" 
                    className={`hover-basic ${active ? 'focus-basic' : ''}`}
                    onClick={(e) => typeof onClick == 'function' ? onClick(e, activity) : null} 
                >
                    Actividad {objective?.index}.{index} : {activity?.title}
                </th>
                <td className="text-right">
                    {currencyFormatter.format(activity?.total, { code: 'PEN' })}
                </td>
                <td width="5%">
                    <div className="text-center w-100">
                        <Show condicion={activity?.verify && activity?.verify_tecnica}>
                            <span className="badge badge-primary mb-1">
                                Verificado
                            </span>
                        </Show>
                        {/* button */}
                        <Show condicion={project.status != 'OVER' && active}>
                            <Button basic 
                                size="mini"
                                color="teal"
                                icon="plus"
                                onClick={(e) => setIsCreate(true)}
                            />
                        </Show>
                    </div>
                    {/* crear gasto */}
                    <Show condicion={is_create}>
                        <AddGasto
                            onSave={() => setIsCreate(false)}
                            activity={activity}
                            isClose={() => setIsCreate(false)}
                        />
                    </Show>
                </td>
            </tr>  
            {/* body */}
            <Show condicion={active}>
                <ListGastos activity={activity}/>
            </Show>
        </Fragment>  
    )
}

// agregar actividad
const CoinActivity = ({ objective, isClose, onCreate }) => {

    // app
    const app_context = useContext(AppContext);

    // project
    const { project, activities, dispatch } = useContext(ProjectContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_index, setCurrentIndex] = useState(0);
 
    // obtener activities
    const getActivities = async (add = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`objective/${objective.id}/activity?page=${activities.page || 1}&principal=1`)
            .then(({ data }) => {
                let payload = { 
                    last_page: data.activities.lastPage,
                    total: data.activities.total,
                    data: add ? [...activities.data, ...data.objectives.data] : data.activities.data
                };
                // setting data
                dispatch({ type: projectTypes.SET_ACTIVITIES, payload });
            }).catch(err => dispatch({ type: projectTypes.SET_ACTIVITIES, payload: { page: 1, data: [] } }));
        setCurrentLoading(false);
    }

    // obtener actividades
    useEffect(() => {
        getActivities();
    }, []);

    // render
    return (
        <Modal
            show={true}
            titulo={<span><i className="fas fa-coins"></i> Programación de Gastos</span>}
            isClose={isClose}
            md="12"
        >  
            <Form className="card-body">
                <div className="row">
                    <div className="col-md-12">
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead className="text-center uppercase font-11" style={{ background: 'rgba(0, 0, 0, 0.05)' }}>
                                    <tr>
                                        <th>Descripción</th>
                                        <th width="10%">Ext Pres.</th>
                                        <th width="7%">Unidad</th>
                                        <th width="7%">Costo unitario(S./)</th>
                                        <th width="7%">Cantidad</th>
                                        <th width="7%">Costo Total(S./)</th>
                                        <th width="7%">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan="7">
                                            <b>Objectivo Específico {objective?.index + 1}: </b> {objective?.title} 
                                        </td>
                                    </tr>
                                    {/* obtener activities */}
                                    <Show condicion={!current_loading}
                                        predeterminado={<Placeholder/>}
                                    >
                                        {activities?.data?.map((act, indexA) => 
                                            <ItemActivity activity={act}
                                                key={`item-presupuesto-${indexA}`}
                                                objective={objective}
                                                active={current_index == indexA}
                                                index={indexA + 1}
                                                onClick={(e) => setCurrentIndex(indexA)}
                                            />
                                        )}
                                        {/* no hay regístros */}
                                        <Show condicion={!activities?.total}>
                                            <tr>
                                                <th colSpan="7" className="text-center">No hay regístros disponibles!</th>
                                            </tr>
                                        </Show>
                                    </Show>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Form>
        </Modal>
    )
}

export default CoinActivity;