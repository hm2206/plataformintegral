import { useRouter } from 'next/router';
import React,  { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import Cover from '../../../components/trabajador/cover';
import NavCover from '../../../components/trabajador/navCover';
import { AUTHENTICATE } from '../../../services/auth';
import { microScale } from '../../../services/apis';
import Show from '../../../components/show';
import InfoGeneral from '../../../components/planilla/work/infoGeneral';
import atob from 'atob';
import Infos from '../../../components/planilla/infos/index';
import NotFoundData from '../../../components/notFoundData';
import { EntityContext } from '../../../contexts/EntityContext';


const TrabajadorID = () => {
    const router = useRouter();
    const { pathname, query } = router;
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [work, setWork] = useState({});

    useEffect(() => {
        if (!AUTHENTICATE()) return;
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        await microScale.get(`works/${id}`)
            .then(res => {
                setSuccess(res.data.success);
                setWork(res.data.work);
            })
            .catch(err => console.error(err));
        setLoading(false);
    };


    // estados
    const [option, setOption] = useState("general");

    const entity_context = useContext(EntityContext);

    const isWork = useMemo(() => {
        return Object.keys(work).length;
    }, [work]);

    if (!success) return <NotFoundData />

    useEffect(() => {
        entity_context.fireEntity({ render: true, disabled: true });
        return () => entity_context.fireEntity({ render: false, disabled: false });
    }, []);

    // render
    return <Fragment>
        <div className="col-md-12">
            <Cover
                back
                titulo={work?.person?.fullName || ''}
                email={work?.person?.emailContact}
                image={'/img/perfil.jpg'}
                documentNumber={work?.person?.documentNumber}
                birhday={work?.person?.date_of_birth}
            />

            <NavCover
                active={option}
                options={[
                    { key: "general", text: "Información General" },
                    { key: "info", text: "Configuración de Pago" }
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
                </div>
            </Show>
        </div>
    </Fragment>
}

// export 
export default TrabajadorID;