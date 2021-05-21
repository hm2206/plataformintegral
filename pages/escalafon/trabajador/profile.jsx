import React,  { Fragment, useMemo, useState } from 'react';
import Cover from '../../../components/trabajador/cover';
import NavCover from '../../../components/trabajador/navCover';
import { AUTHENTICATE } from '../../../services/auth';
import { escalafon } from '../../../services/apis';
import Show from '../../../components/show';
import InfoGeneral from '../../../components/escalafon/infoGeneral';
import atob from 'atob';
import Contratos from '../../../components/escalafon/contratos';
import Grado from '../../../components/escalafon/grado';
import Ascenso from '../../../components/escalafon/ascenso';
import Familiar from '../../../components/escalafon/familiar';
import Desplazamiento from '../../../components/escalafon/desplazamiento';
import Merito from '../../../components/escalafon/merito';
import Licencia from '../../../components/escalafon/licencia';
import Permiso from '../../../components/escalafon/permiso';
import Vacacion from '../../../components/escalafon/vacacion';
import NotFoundData from '../../../components/notFoundData';


const TrabajadorID = ({ pathname, query, success, work }) => {


    // estados
    const [option, setOption] = useState("general");

    const isWork = useMemo(() => {
        return Object.keys(work).length;
    }, [work]);

    if (!success) return <NotFoundData/>

    // render
    return <Fragment>
        <div className="col-md-12">
            <Cover
                back
                titulo={work?.person?.fullname}
                email={work?.person?.email_contact}
                image={work?.person?.image ? `${work?.person?.image_images?.image_200x200}` : '/img/perfil.jpg'}
            />

            <NavCover
                active={option}
                options={[
                    { key: "general", text: "Información General" },
                    { key: "info", text: "Contratos" },
                    { key: "grados", text: "Formación Aca." },
                    { key: "ascenso", text: "Ascensos" },
                    { key: "familiar", text: "Familia" },
                    { key: "desplazamiento", text: "Desplazamientos" },
                    { key: "merito", text: "Mérito/Demérito" },
                    { key: "licencia", text: "Licencias" },
                    { key: "permiso", text: "Permisos" },
                    { key: "vacacion", text: "Vacaciónes" }
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
                        <Contratos work={work}/>
                    </Show>
                    <Show condicion={option == 'grados'}>
                        <Grado work={work}/>
                    </Show>
                    <Show condicion={option == 'ascenso'}>
                        <Ascenso work={work}/>
                    </Show>
                    <Show condicion={option == 'familiar'}>
                        <Familiar work={work}/>
                    </Show>
                    <Show condicion={option == 'desplazamiento'}>
                        <Desplazamiento work={work}/>
                    </Show>
                    <Show condicion={option == 'merito'}>
                        <Merito work={work}/>
                    </Show>
                    <Show condicion={option == 'licencia'}>
                        <Licencia work={work}/>
                    </Show>
                    <Show condicion={option == 'permiso'}>
                        <Permiso work={work}/>
                    </Show>
                    <Show condicion={option == 'vacacion'}>
                        <Vacacion work={work}/>
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