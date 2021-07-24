import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';
import AddTeam from './addTeam';
import Show from '../show';
import { BtnFloat } from '../Utils';
import { handleErrorRequest, projectTracking } from '../../services/apis';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { Confirm } from '../../services/utils';
import { AppContext } from '../../contexts/AppContext';
import Swal from 'sweetalert2';
import Skeleton from 'react-loading-skeleton';
import Router from 'next/router';
import { projectTypes } from '../../contexts/project-tracking/ProjectReducer';

const Placeholder = () => {
    const datos = [1, 2, 3, 4, 5];
    return datos.map(d => 
        <tr>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
        </tr>    
    )
}

const ItemTeam = ({ team }) => {

    // project
    const { project, dispatch } = useContext(ProjectContext);
    
    // estados
    const [current_loading, setCurrentLoading] = useState(false);

    const handleDelete = async () => {
        let answer = await Confirm('warning', `¿Deseas eliminar del equipo?`, 'Eliminar');
        if (!answer) return false;
        setCurrentLoading(true);
        await projectTracking.post(`team/${team.id}/delete`, {})
        .then(async res => {
            let { message } = res.data;
            await Swal.fire({ icon: 'success', text: message });
            dispatch({ type: projectTypes.DELETE_TEAM, payload: team });
            // eliminar principal del project
            if (!team.principal) return;
            let newProject = Object.assign({}, project);
            newProject.principal = {};
            dispatch({ type: projectTypes.SET_PROJECT, payload: newProject })
        }).catch(err => handleErrorRequest(err));
        setCurrentLoading(false);
    }
    
    // render
    return (
        <tr>
            <td className="text-center uppercase">{team?.user?.person?.fullname}</td>
            <td className="text-center uppercase">{team?.user?.username}</td>
            <td className="text-center uppercase">{team?.dependencia?.nombre || 'Exterior'}</td>
            <td className="text-center uppercase">{team?.role?.description}</td>
            <Show condicion={project.state != "OVER"}>
                <td className="text-center">
                    <Button color="red" basic
                        size="mini"
                        onClick={handleDelete}
                        loading={current_loading}
                        disabled={current_loading}
                    >
                        <i className="fas fa-times"></i>
                    </Button>
                </td>
            </Show>
        </tr>
    )
}

const TabTeam = () => {

    // app
    const app_context = useContext(AppContext);

    // project
    let { project, teams, dispatch } = useContext(ProjectContext);
    let isProject = Object.keys(project).length;

    // estados
    const [is_create, setIsCreate] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);

    // obtener equipo
    const getTeam = async (add = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`project/${project.id}/team?page=${teams.page}`)
            .then(async ({ data }) => {
                let payload = { 
                    last_page: data.teams.lastPage,
                    total: data.teams.total,
                    data: add ? [...teams.data, ...data.teams.data] : data.teams.data
                };
                // setting
                dispatch({ type: projectTypes.SET_TEAMS, payload });
            }).catch(err => console.log(err));
        setCurrentLoading(false);
    }

    // primera carga
    useEffect(() => {
        if (isProject) getTeam();
    }, []);

    // render
    return (
    <Fragment>
        <div className="table-responsive font-13">
            <table className="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th className="text-center">Apellidos y Nombres</th>
                        <th className="text-center">Usuario</th>
                        <th className="text-center">Dependencia</th>
                        <th className="text-center">Rol</th>
                        <th className="text-center">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
                    <Show condicion={!current_loading}
                        predeterminado={<Placeholder/>}
                    >
                        {teams?.data?.map((t, indexT) =>
                            <ItemTeam key={`team-person-${indexT}`}
                                team={t}
                            />
                        )}
                        {/* no hay registros */}
                        <Show condicion={!teams?.total}>
                            <tr>
                                <td colSpan="5" className="text-center">No hay registros disponibles</td>
                            </tr>
                        </Show>
                    </Show>
                </tbody>
            </table>
        </div>
        {/* agregar equipo */}
        <Show condicion={project.state != "OVER"}>
            <BtnFloat onClick={() => setIsCreate(true)}>
                <i className="fas fa-plus"></i>
            </BtnFloat>
        </Show>
        {/* modal agregar equipo */}
        <Show condicion={is_create}>
            <AddTeam isClose={(e) => setIsCreate(false)}
                onSave={(e) => setIsCreate(false)}
            />
        </Show>
    </Fragment>)
}

export default TabTeam;