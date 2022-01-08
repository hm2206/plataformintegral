import React, { useState, useEffect, Fragment } from 'react';
import Skeleton from 'react-loading-skeleton';
import Show from '../../show'
import { microPlanilla } from '../../../services/apis';
import moment from 'moment';
import { BtnFloat } from '../../Utils';
import CreateInfo from './create-info.jsx';
import ItemInfo from './item-info';
import EditContract from './edit-info';
import { SelectWorkToContract } from '../../select/micro-planilla';

const Placeholder = () => {

    const datos = [1, 2, 3, 4];

    return <Fragment>
        <div className="col-md-12"></div>
        {datos.map((d, indexD) => 
            <div className="col-md-6 mb-3" key={`placeholder-contrato-${indexD}`}>
                <Skeleton height="50px"/>
                <Skeleton height="150px"/>
            </div>
        )}
    </Fragment>
}

const Infos = ({ work }) => {

  // estados
  const [current_loading, setCurrentLoading] = useState(false);
  const [option, setOption] = useState();
  const [current_info, setCurrentInfo] = useState({})
  
  const handleInputInfo = ({ options = [], value }) => {
    const current = options.find(c => c.value == value);
    setCurrentInfo(current?.obj || {});
  }

  // render
  return (
    <div className="row">
      <div className="col-md-12">
        <h5 className="ml-3">Listado configuración de pago</h5>
        <div className="col-md-6 col-lg-4 col-12 col-sm-12">
          <SelectWorkToContract
            workId={work.id}
            onChange={(e, obj) => handleInputInfo(obj)}
            value={`${current_info?.id || ''}`}
            displayText={(data) => {
              return `${data?.typeCategory?.name} | ${data?.resolution} | ${moment(data?.dateOfResolution).format('DD/MM/YYYY')}`;
            }}
          />
        </div>
        <hr/>
      </div>
      
      <Show condicion={Object.keys(current_info).length}>
        <div className="col-md-6 col-lg-4 col-sm-12 mb-2">
          <ItemInfo info={current_info} />
        </div>

        <div className='col-md-6 col-lg-8 col-sm-12 mb-2'></div>

        {/*  crear info */}
        <BtnFloat theme="btn-success"
          style={{ bottom: '50px' }}
          onClick={() => setOption("CREATE")}>
          <i className="fas fa-plus"></i>
        </BtnFloat>
      </Show>


      <Show condicion={option == 'CREATE'}>
        <CreateInfo 
          contract={current_info}
          onClose={() => setOption()}
          work={work}
        />
      </Show>

      {/* <Show condicion={option == 'EDIT'}>
        <EditContract 
          infoDefault={current_info}
          onClose={() => setOption()}
          work={work}
          onSave={handleSave}
        />
      </Show> */}
    </div>
  )
}

// export 
export default Infos;