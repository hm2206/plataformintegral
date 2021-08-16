import React, { useContext, useEffect, useState, Fragment } from 'react';
import { handleErrorRequest, signature } from '../../../services/apis';
import { GroupContext } from '../../../contexts/signature/GroupContext';
import { groupTypes } from '../../../contexts/signature/GroupReducer';
import CardReflow from '../../cardReflow';
import { AppContext } from '../../../contexts/AppContext';
import Swal from 'sweetalert2';
import { Confirm } from '../../../services/utils';


const ListTeam = () => {

    // app
    const app_context = useContext(AppContext);

    // group
    const  { group, dispatch, count_total, count_verify, teams }= useContext(GroupContext);

    // actiones
    const show_status = ['START', 'VERIFIED'];

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [is_error, setIsError] = useState(false);
    const [is_refresh, setIsRefresh] = useState(false);

    // config headers
    const configHeades = {
        DependenciaId: group.dependencia_id,
        GroupId: group.id
    }

    // obtener equipo
    const getTeam = async (add = false) => {
        setCurrentLoading(true);
        // options
        let options = {
            headers: { ...configHeades }
        }
        let query_string = `page=${current_page}`;
        // request
        await signature.get(`auth/group/${group.id}/team?${query_string}`, options)
        .then(res => {
            let { teams, verify } = res.data;
            let payload = [];
            // preparar datos
            teams.data.map(t => {
                let { certificate } = t || {};
                payload.push({
                    id: t.id,
                    title: certificate?.person?.fullname || "",
                    classNameTitle: "capitalize",
                    description: certificate?.subject?.title || certificate?.subject?.organizationName || "",
                    check: t.verify ? true : false,
                    _delete: true,
                })
            });
            // setting
            setCurrentLastPage(teams.lastPage || 0);
            dispatch({ type: groupTypes.SET_COUNT_TOTAL, payload: teams.total || 0 });
            dispatch({ type: groupTypes.SET_COUNT_VERIFY, payload: verify || 0 });
            dispatch({ type: add ? groupTypes.PUSH_TEAM : groupTypes.SET_TEAM, payload: payload });
            setIsError(false);
        }).catch(err => setIsError(true));
        setCurrentLoading(false);
    }

    // eliminar
    const handleDelete = async (index, team) => {
        let answer = await Confirm('warning', `¿Estas seguro en eliminar del equipo?`)
        if (!answer) return false;
        app_context.setCurrentLoading(true);
        // options
        let options = { headers: { ...configHeades } }
        // request
        await signature.post(`auth/team/${team.id}?_method=DELETE`, {}, options)
        .then(res => {
            app_context.setCurrentLoading(false);
            let { message } = res.data;
            Swal.fire({ icon: 'success', text: message });
            if (team.check) dispatch({ type: groupTypes.DECREMENT_COUNT_VERIFY });
            dispatch({ type: groupTypes.DELETE_TEAM, payload: team.id });
            dispatch({ type: groupTypes.DECREMENT_COUNT_TOTAL });
        }).catch(err => handleErrorRequest(err, null, app_context.setCurrentLoading(false)));
    }

    // primera carga
    useEffect(() => {
        getTeam();
    }, []);

    // refrescar
    useEffect(() => {
        if (is_refresh) {
            getTeam();
            setIsRefresh(false);
        }
    }, [is_refresh]);

    // renderizado
    return (
        <Fragment>
            <CardReflow
                onRefresh={(e) => setIsRefresh(true)}
                items={teams}
                start={count_verify || 0}
                over={count_total || 0}
                title={`Firmantes`}
                info={`Equipo`}
                onDelete={show_status.includes(group.status) ? handleDelete : null}
            />
        </Fragment>
    )
}

export default ListTeam;