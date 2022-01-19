import React, { useContext, useEffect } from 'react';
import { BtnBack } from '../../../components/Utils';
import { microPlanilla } from '../../../services/apis';
import atob from 'atob';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple'
import HeaderCronograma from '../../../components/planilla/cronograma/headerCronograma'
import { EntityContext } from '../../../contexts/EntityContext';
import NotFoundData from '../../../components/notFoundData';
import RemoveHistorial from '../../../components/planilla/cronograma/remove-historial';

const RemoveCronograma = ({ success, cronograma }) => {

  // validar data
  if (!success) return <NotFoundData/>

  // entity
  const entity_context = useContext(EntityContext);
  
  useEffect(() => {
    entity_context.fireEntity({ render: true, entity_id: cronograma.campusId, disabled: true });
    return () => entity_context.fireEntity({ render: false, disabled: false });
  }, []);

  // render
  return (
    <>
      <div className="col-md-12">
        <BoardSimple
          title={<HeaderCronograma cronograma={cronograma}/>}
          info={["Remover trabajadores del cronograma"]}
          prefix={<BtnBack/>}
          bg="light"
          options={[]}
        >
          <RemoveHistorial cronograma={cronograma}/>
        </BoardSimple>
      </div>
    </>
  )
};

// server rendering
RemoveCronograma.getInitialProps = async (ctx) => {
  await AUTHENTICATE(ctx);
  let { query, pathname } = ctx;
  // obtener id
  let id = atob(query.id) || "__error";
  //find cronograma
  let { success, cronograma } = await microPlanilla.get(`cronogramas/${id}`, {}, ctx)
    .then(res => ({ success: true, cronograma: res.data }))
    .catch(() => ({ success: false, cronograma: {} }));
  // response
  return { query, pathname, success, cronograma };
}

// export 
export default RemoveCronograma;