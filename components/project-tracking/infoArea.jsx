import React, { useContext, useEffect, useState } from 'react';
import Show from '../show';
import { ProjectContext } from '../../contexts/project-tracking/ProjectContext';
import { projectTypes } from '../../contexts/project-tracking/ProjectReducer';
import { SelectArea } from '../select/project_tracking';
import { handleErrorRequest, projectTracking } from '../../services/apis';
import Skeleton from 'react-loading-skeleton';
import { Confirm } from '../../services/utils';
import Swal from 'sweetalert2';

const Placeholder = () => {
    const datos = [1, 2, 3, 4];
    // render
    return (
        <div className="row">
            {datos.map(d => 
                <div className="col-3"
                    key={`list-placeholder-area-${d}`}
                >
                    <Skeleton/>
                </div>    
            )}
        </div>
    )
}

const InfoArea = () => {

    // project
    const { project, areas, dispatch } = useContext(ProjectContext);

    // estados
    const [is_add, setIsAdd] = useState(false);
    const [current_loading, setCurrentLoading] = useState(false);

    // obtener areas
    const getAreas = async (add = false) => {
        setCurrentLoading(true);
        await projectTracking.get(`project/${project.id}/area?page=${areas.page || 1}`)
        .then(({ data }) => {
            let payload = {
                last_page: data.areas.lastPage,
                total: data.areas.total,
                data: add ? [...areas.data, ...data.areas.data] : data.areas.data
            }
            // setting datos
            dispatch({ type: projectTypes.SET_AREAS, payload });
        }).catch(err => console.log(err));
        setCurrentLoading(false);
    }

    // add línea de investigación
    const handleAdd = async (e, { value }) => {
        let answer = await Confirm('warning', `¿Estas seguro en agregar la línea de investigación al proyecto?`, 'Agregar');
        if (!answer || !value) return false;
        let datos = {};
        datos.area_id = value;
        datos.project_id = project.id;
        setCurrentLoading(true);
        await projectTracking.post(`config_project_area`, datos)
        .then(async res => {
            let { success, message } = res.data;
            if (!success) throw new Error(message);
            setIsAdd(false);
            await Swal.fire({ icon: 'success', text: message });
            getAreas();
        }).catch(err => handleErrorRequest(err, (error) => {
            Swal.fire({ icon: 'error', text: error.message });
        }));
        setCurrentLoading(false);
    }
 
    // eliminar línea de investigación
    const handleDelete = async (e, obj) => {
        e.preventDefault();
        if (project.state != 'OVER' && project.state != 'PREOVER') {
            let answer = await Confirm("warning", "¿Estás seguro en eliminar la línea de investigación?");
            if (!answer) return false;
            setCurrentLoading(true);
            await projectTracking.post(`config_project_area/${obj.id}/delete`)
            .then(res => {
                let { success, message } = res.data;
                if (!success) throw new Error(message);
                Swal.fire({ icon: 'success', text: message });
                dispatch({ type: projectTypes.DELETE_AREA, payload: obj.id });
            }).catch(err => handleErrorRequest((err), (error) => {
                Swal.fire({ icon: 'error', text: error.message });
            }));
            setCurrentLoading(false);
        }
    }

    useEffect(() => {
        if (project) getAreas();
    }, [project])

    if (current_loading) return <Placeholder/>

    // render
    return (
        <Show condicion={!is_add}
            predeterminado={
                <div className="row">
                    <div className="col-md-10">
                        <SelectArea
                            name="area_id"
                            onChange={handleAdd}
                        />
                    </div>
                    <div className="col-md-2">
                        <button className="ml-1 btn btn-sm btn-outline-red"
                            onClick={(e) => setIsAdd(false)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            }
        >
            <Show condicion={project?.state != 'OVER' && project?.state != 'PREOVER'}>
                <button className="ml-1 btn btn-sm btn-outline-primary"
                    onClick={(e) => setIsAdd(true)}
                >
                    <i className="fas fa-plus"></i>
                </button>
            </Show>

            {areas?.data.map((a, indexA) => 
                <span className="ml-2 badge badge-light uppercase" 
                    key={`linea-de-investigacion-${indexA}`}
                >
                    {a?.description} 
                    <i className="text-danger fas fa-times cursor-pointer ml-1" onClick={(e) => handleDelete(e, a)}></i>
                </span>    
            )}
            {/* next page */}
            <Show condicion={(areas?.last_page >= (areas?.page + 1))}>
                <span className="badge badge-light m-2 cursor-pointer">
                    <i class="fas fa-ellipsis-h"></i>
                </span>
            </Show>
        </Show>
    )
}

export default InfoArea;