import React, { useContext, useEffect, useState, Fragment } from 'react';
import { signature } from '../../services/apis';
import { GroupContext } from '../../contexts/SignatureContext';
import CardReflow from '../cardReflow';
import Show from '../show';
import Skeleton from 'react-loading-skeleton';


const ListTeam = () => {

    // group
    const  { group }= useContext(GroupContext);

    // estados
    const [current_loading, setCurrentLoading] = useState(false);
    const [datos, setDatos] = useState([]);
    const [current_page, setCurrentPage] = useState(1);
    const [current_last_page, setCurrentLastPage] = useState(0);
    const [current_total, setCurrentTotal] = useState(0);
    const [is_error, setIsError] = useState(false);
    const [verify_count, setVerifyCount] = useState(0);

    // obtener equipo
    const getTeam = async (add = false) => {
        setCurrentLoading(true);
        // options
        let options = {
            headers: {
                DependenciaId: group.dependencia_id,
                GroupId: group.id
            }
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

    // primera carga
    useEffect(() => {
        getTeam();
    }, []);

    // renderizado
    return (
        <Fragment>
            <CardReflow
                items={datos}
                start={verify_count || 0}
                over={current_total || 0}
                title={`Firmantes`}
                info={`Equipo`}
                onDelete={(e) => alert('ok')}
            />
        </Fragment>
    )
}

export default ListTeam;