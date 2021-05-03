import React,  { Fragment, useState, useMemo } from 'react';
import Cover from '../../../components/trabajador/cover';
import NavCover from '../../../components/trabajador/navCover';
import { AUTHENTICATE } from '../../../services/auth';
import {  unujobs } from '../../../services/apis';
import Show from '../../../components/show';
import General from '../../../components/trabajador/general';
import atob from 'atob';
import Contratos from '../../../components/trabajador/contratos';
import NotFoundData from '../../../components/notFoundData';


const TrabajadorID = ({ pathname, query, success, work }) => {


    // estados
    const [option, setOption] = useState("general");

    // memo
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
                    { key: "info", text: "Contratos" }
                ]}
                getOption={(key) => setOption(key)}
            />

            {/* Contenidos */}
            <Show condicion={isWork}>
                <div className="col-md-12 mt-5">
                    <Show condicion={option == 'general'}>
                        <General work={work}/>
                    </Show>
                    <Show condicion={option == 'info'}>
                        <Contratos work={work}/>
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