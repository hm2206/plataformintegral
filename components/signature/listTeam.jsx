import React, { useContext, useEffect, useState, Fragment } from 'react';
import { handleErrorRequest, signature } from '../../services/apis';
import { GroupContext } from '../../contexts/SignatureContext';
import CardReflow from '../cardReflow';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';
import { AppContext } from '../../contexts/AppContext';
import Swal from 'sweetalert2';
import { Confirm } from '../../services/utils';


const ListTeam = () => {

    // app
    const app_context = useContext(AppContext);

    // group
    const  { group }= useContext(GroupContext);

    // actiones
    const show_status = ['START', 'VERIFIED'];

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [is_error, setIsError] = useState(false);
    const [verify_count, setVerifyCount] = useState(0);
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
                    title: certificate.person && certificate.person.fullname || "",
                    classNameTitle: "capitalize",
                    description: certificate.subject && certificate.subject.title || "",
                    check: t.verify ? true : false,
                    _delete: true,
                })
            });
            // setting
            setVerifyCount(verify || 0)
            setCurrentLastPage(teams.lastPage || 0);
            setCurrentTotal(teams.total || 0);
            setDatos(add ? [...datos, ...payload] : payload);
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
                items={datos}
                start={verify_count || 0}
                over={current_total || 0}
                title={`Firmantes`}
                info={`Equipo`}
                onDelete={show_status.includes(group.status) ? handleDelete : null}
            />
        </Fragment>
    )
}

export default ListTeam;