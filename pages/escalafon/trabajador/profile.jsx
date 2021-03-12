import React,  { Component, Fragment, useState, useContext } from 'react';
import Router from 'next/router';
import Cover from '../../../components/trabajador/cover';
import NavCover from '../../../components/trabajador/navCover';
import { AUTHENTICATE } from '../../../services/auth';
import {  unujobs } from '../../../services/apis';
import Show from '../../../components/show';
import General from '../../../components/trabajador/general';
import { AppContext } from '../../../contexts/AppContext'
import { backUrl } from '../../../services/utils'
import atob from 'atob';
import Contratos from '../../../components/trabajador/contratos';
import Grado from '../../../components/trabajador/grado';
import Ascenso from '../../../components/trabajador/ascenso';
import Familiar from '../../../components/trabajador/familiar';
import Desplazamiento from '../../../components/trabajador/desplazamiento';
import Merito from '../../../components/trabajador/merito';
import Licencia from '../../../components/trabajador/licencia';
import Permiso from '../../../components/trabajador/permiso';
import Vacacion from '../../../components/trabajador/vacacion';
import NotFoundData from '../../../components/notFoundData';


const TrabajadorID = ({ pathname, query, success, work }) => {


    // estados
    const [option, setOption] = useState("general");

    if (!success) return <NotFoundData/>

    // render
    return <Fragment>
        <div className="col-md-12">
            <Cover
                back
                titulo={work && work.person && work.person.fullname}
                email={work && work.person && work.person.email_contact}
                image={work && work.person && work.person.image ? `${work.person.image && work.person.image_images && work.person.image_images.image_200x200}` : '/img/perfil.jpg'}
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
            <Show condicion={typeof work == 'object' && Object.values(work).length}>
                <div className="col-md-12 mt-5">
                    <Show condicion={option == 'general'}>
                        <General work={work}/>
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
    let { success, work } = await unujobs.get(`work/${id}`, {}, ctx)
        .then(res => res.data)
        .catch(err => ({ success: false, work: {} }));
    // response
    return { pathname, query, success, work }
}

// export 
export default TrabajadorID;