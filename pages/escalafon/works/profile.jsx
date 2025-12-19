import { useRouter } from 'next/router';
import React,  { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import Cover from '../../../components/trabajador/cover';
import NavCover from '../../../components/trabajador/navCover';
import { AUTHENTICATE } from '../../../services/auth';
import { microPlanilla } from '../../../services/apis';
import Show from '../../../components/show';
import InfoGeneral from '../../../components/escalafon/work/infoGeneral';
import atob from 'atob';
import Infos from '../../../components/escalafon/contract/index';
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
        await microPlanilla.get(`works/${id}`)
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
                    { key: "info", text: "Contratos" }
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