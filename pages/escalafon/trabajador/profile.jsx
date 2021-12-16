import React,  { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import Cover from '../../../components/trabajador/cover';
import NavCover from '../../../components/trabajador/navCover';
import { AUTHENTICATE } from '../../../services/auth';
import { escalafon } from '../../../services/apis';
import Show from '../../../components/show';
import InfoGeneral from '../../../components/escalafon/infoGeneral';
import atob from 'atob';
import Infos from '../../../components/escalafon/infos/index';
import Ballot from '../../../components/escalafon/ballots/index';
import Ascent from '../../../components/escalafon/ascent/index';
import Degrees from '../../../components/escalafon/degrees/index';
import Family from '../../../components/escalafon/family/index';
import Displacement from '../../../components/escalafon/displacement/index';
import Merit from '../../../components/escalafon/merit/index';
import License from '../../../components/escalafon/license/index.jsx';
import ConfigVacation from '../../../components/escalafon/config_vacation/index';
import Schedule from '../../../components/escalafon/schedule/index.jsx';
import NotFoundData from '../../../components/notFoundData';
import { EntityContext } from '../../../contexts/EntityContext';


const TrabajadorID = ({ pathname, query, success, work }) => {


    // estados
    const [option, setOption] = useState("general");

    const entity_context = useContext(EntityContext);

    const isWork = useMemo(() => {
        return Object.keys(work).length;
    }, [work]);

    if (!success) return <NotFoundData/>

    useEffect(() => {
        entity_context.fireEntity({ render: true, disabled: true });
        return () => entity_context.fireEntity({ render: false, disabled: false });
    }, []);

    // render
    return <Fragment>
        <div className="col-md-12">
            <Cover
                back
                titulo={work?.person?.fullname}
                email={work?.person?.email_contact}
                image={work?.person?.image ? `${work?.person?.image_images?.image_200x200}` : '/img/perfil.jpg'}
                documentNumber={work?.person?.document_number}
                birhday={work?.person?.date_of_birth}
                cargo={work?.infoCurrent?.perfil_laboral?.nombre}
            />

            <NavCover
                active={option}
                options={[
                    { key: "general", text: "Información General" },
                    { key: "info", text: "Contratos" },
                    { key: "schedule", text: "Horarios" },
                    { key: "papeletas", text: "Papeletas" },
                    { key: "vacation", text: "Vacaciones" },
                    { key: "licencia", text: "Licencias/Permisos" },
                    { key: "ascenso", text: "Ascensos" },
                    { key: "desplazamiento", text: "Desplazamientos" },
                    { key: "merito", text: "Mérito/Demérito" },
                    { key: "grados", text: "Formación Aca." },
                    { key: "familiar", text: "Familia" },
                ]}
                getOption={(key) => setOption(key)}
            />

            {/* Contenidos */}
            <Show condicion={isWork}>
                <div className="col-md-12 mt-5">
                    <Show condicion={option == 'general'}>
                        <InfoGeneral work={work}/>
                    </Show>
                    <Show condicion={option == 'info'}>
                        <Infos work={work}/>
                    </Show>
                    <Show condicion={option == 'schedule'}>
                        <Schedule work={work}/>
                    </Show>
                    <Show condicion={option == 'papeletas'}>
                        <Ballot work={work}/>
                    </Show>
                    <Show condicion={option == 'vacation'}>
                        <ConfigVacation work={work}/>
                    </Show>
                    <Show condicion={option == 'licencia'}>
                        <License work={work}/>
                    </Show>
                    <Show condicion={option == 'ascenso'}>
                        <Ascent work={work}/>
                    </Show>
                    <Show condicion={option == 'desplazamiento'}>
                        <Displacement work={work}/>
                    </Show>
                    <Show condicion={option == 'merito'}>
                        <Merit work={work}/>
                    </Show>
                    <Show condicion={option == 'grados'}>
                        <Degrees work={work}/>
                    </Show>
                    <Show condicion={option == 'familiar'}>
                        <Family work={work}/>
                    </Show>
                </div>
            </Show>
        </div>
    </Fragment>
}

// server
TrabajadorID.getInitialProps = async (ctx) => {
    await AUTHENTICATE(ctx);
    let { query, pathname } = ctx;
    let id = atob(query.id || "") || "_error";
    let { success, work } = await escalafon.get(`works/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, work: {} }));
    // response
    return { pathname, query, success, work }
}

// export 
export default TrabajadorID;