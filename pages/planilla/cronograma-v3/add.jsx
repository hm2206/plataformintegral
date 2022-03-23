import React, { useContext, useEffect } from 'react';
import { BtnBack } from '../../../components/Utils';
import { microPlanilla } from '../../../services/apis';
import atob from 'atob';
import { AUTHENTICATE } from '../../../services/auth';
import BoardSimple from '../../../components/boardSimple'
import HeaderCronograma from '../../../components/planilla/cronograma/headerCronograma'
import { EntityContext } from '../../../contexts/EntityContext';
import NotFoundData from '../../../components/notFoundData';
import AddHistorial from '../../../components/planilla/cronograma/add-historial';

const AddCronograma = ({ success, cronograma }) => {

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

// server rendering
AddCronograma.getInitialProps = async (ctx) => {
  AUTHENTICATE(ctx);
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
export default AddCronograma;