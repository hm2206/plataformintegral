import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { BtnBack, BtnFloat } from '../../../components/Utils';
import { AUTHENTICATE } from '../../../services/auth';
import Router from 'next/dist/client/router';
import Show from '../../../components/show';
import { microPlanilla } from '../../../services/apis';
import SearchCronograma from '../../../components/cronograma/searchCronograma';
import atob from 'atob'
import BasicReport from '../../../components/planilla/cronograma/basicReport';
import HeaderCronograma from '../../../components/planilla/cronograma/headerCronograma';
import BoardSimple from '../../../components/boardSimple';
import NotFoundData from '../../../components/notFoundData';


const Report = ({ cronograma }) => {
    const router = useRouter();
    const { pathname, query } = router;

    useEffect(() => {
        if (!AUTHENTICATE()) return;
    }, []);


    // validar data
    if (!cronograma?.id) return <NotFoundData/>

    // estado
    const [option, setOption] = useState("");
    const [is_select, setIsSelect] = useState(false);

    // seleccionar cronograma
    const handleSelect = async (cro) => {
        let { push } = Router;
        let id = btoa(cro.id);
        query.id = id;
        setIsSelect(true);
        setOption("");
        await push({ pathname, query });
    }

    // deseleccionar
    useEffect(() => {
        if (is_select) setIsSelect(false);
    }, [is_select]);

    // render
    return(
            <div className="col-md-12">
                <BoardSimple
                    title={<HeaderCronograma cronograma={cronograma}/>}
                    info={["Reportes"]}
                    prefix={<BtnBack/>}
                    bg="light"
                    options={[]}
                >
                    <Show condicion={!is_select}>
                        <BasicReport cronograma={cronograma}/>
                    </Show>
                </BoardSimple>


                <BtnFloat style={{ top: '60vh' }}
                    theme="btn-warning"
                    size="md"
                    onClick={(e) => setOption("search_cronograma")}
                >
                    <i className="fas fa-search"></i>
                </BtnFloat>

                {/* cambiar de cronograma */}
                <SearchCronograma
                    show={option == "search_cronograma" ? true : false}
                    cronograma={cronograma}
                    isClose={e => setOption("")}
                    onSelect={handleSelect}
                />
            </div>
        )
}

// exportar
export default Report;