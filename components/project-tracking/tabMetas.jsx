import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';
import AddTeam from './addTeam';
import Show from '../show';
import { projectTracking } from '../../services/apis';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { Confirm } from '../../services/utils';
import { AppContext } from '../../contexts/AppContext';
import Swal from 'sweetalert2';

const TabTeam = () => {

    // app
    const app_context = useContext(AppContext);

    // project
    let { project } = useContext(ProjectContext);
    let isProject = Object.keys(project).length;

    // estados
    const [option, setOption] = useState("");
    const [current_loading, setCurrentLoading] = useState(false);
    const [team, setTeam] = useState({ last_page: 0, total: 0, page: 1, data: []});
    const isTeam = team.data.length;

    // obtener equipo
    const getTeam = async (nextPage = 1, up = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`project/${project.id}/team?page=${nextPage}`)
            .then(({ data }) => {
                setTeam({ 
                    last_page: data.teams.last_page,
                    total: data.teams.total,
                    data: up ? [...team.data, ...data.teams.data] : data.teams.data,
                    page: data.teams.page
                });
            }).catch(err => console.log(err));
        setCurrentLoading(false);
    }

    // eliminar del equipo
    const deleteTeam = async (id) => {
        let answer = await Confirm('warning', `¿Deseas eliminar del equipo?`, 'Eliminar')
        if (answer) {
            app_context.setCurrentLoading(true);
            await projectTracking.post(`team/${id}/delete`, {})
                .then(res => {
                    app_context.setCurrentLoading(false);
                    let { success, message } = res.data;
                    Swal.fire({ icon: 'success', text: message });
                    getTeam();
                }).catch(err => {
                    app_context.setCurrentLoading(false);
                    Swal.fire({ icon: 'error', text: err.message });
                })
        }
    }

    // primera carga
    useEffect(() => {
        if (isProject) getTeam();
    }, []);

    // render
    return (
    <Fragment>
        <div className="table-responsive">
            <table className="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th className="text-center">Apellidos y Nombres</th>
                        <th className="text-center">N° Documento</th>
                        <th className="text-center">Rol</th>
                        <th className="text-center">Profesión</th>
                        <th width="5%">
                            <Button fluid 
                                basic 
                                size="mini"
                                color="green" 
                                onClick={(e) => setOption("add_team")}
                            >
                                <i className="fas fa-plus"></i>
                            </Button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {team.data.map((t, indexT) =>
                        <tr key={`team-person-${indexT}`}>
                            <td className="text-center uppercase">{t.person && t.person.fullname}</td>
                            <td className="text-center uppercase">{t.person && t.person.document_number}</td>
                            <td className="text-center uppercase">{t.role}</td>
                            <td className="text-center uppercase">{t.person && t.person.profession}</td>
                            <td>
                                <Button color="red" basic
                                    size="mini"
                                    onClick={(e) => deleteTeam(t.id)}
                                >
                                    <i className="fas fa-times"></i>
                                </Button>
                            </td>
                        </tr>
                    )}
                    <Show condicion={!current_loading && !isTeam}>
                        <tr>
                            <td colSpan="5" className="text-center">No hay registros disponibles</td>
                        </tr>
                    </Show>
                </tbody>
            </table>
        </div>

        <Show condicion={option == "add_team"}>
            <AddTeam 
                isClose={(e) => setOption("")}
                onCreate={(e) => getTeam()}
            />
        </Show>
    </Fragment>)
}

export default TabTeam;