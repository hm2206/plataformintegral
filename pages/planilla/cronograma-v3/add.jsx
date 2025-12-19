import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { BtnBack } from '../../../components/Utils';
import { microPlanilla } from '../../../services/apis';
import atob from 'atob';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple'
import HeaderCronograma from '../../../components/planilla/cronograma/headerCronograma'
import { EntityContext } from '../../../contexts/EntityContext';
import NotFoundData from '../../../components/notFoundData';
import AddHistorial from '../../../components/planilla/cronograma/add-historial';

const AddCronograma = () => {
    const router = useRouter();
    const { pathname, query } = router;
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [cronograma, setCronograma] = useState({});

    useEffect(() => {
        if (!AUTHENTICATE()) return;
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        await microPlanilla.get(`cronogramas/${id}`)
            .then(res => {
                setSuccess(res.data.success);
                setCronograma(res.data.cronograma);
            })
            .catch(err => console.error(err));
        setLoading(false);
    };


  // validar data
  if (!success) return <NotFoundData/>

  // entity
  const entity_context = useContext(EntityContext);
  
  useEffect(() => {
    entity_context.fireEntity({ render: true, entity_id: cronograma.campusId, disabled: true });
    return () => entity_context.fireEntity({ render: false, disabled: false });
  }, [entity_context]);

  // render
  return (
    <>
      <div className="col-md-12">
        <BoardSimple
          title={<HeaderCronograma cronograma={cronograma}/>}
          info={["Agregar trabajadores al cronograma"]}
          prefix={<BtnBack/>}
          bg="light"
          options={[]}
        >
          <AddHistorial cronograma={cronograma}/>
        </BoardSimple>
      </div>
    </>
  )
};

// export 
export default AddCronograma;