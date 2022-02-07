import React, { useState, useEffect, Fragment } from 'react';
import Skeleton from 'react-loading-skeleton';
import Show from '../../show'
import { microPlanilla } from '../../../services/apis';
import moment from 'moment';
import { BtnFloat } from '../../Utils';
import CreateInfo from './create-info.jsx';
import ItemInfo from './item-info';
import ItemContract from '../contract/item-contract';
import { SelectWorkToContract } from '../../select/micro-planilla';
import EditInfo from './edit-info';

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
  const [current_infos, setCurrentInfos] = useState([]);
  const [page, setPage] = useState(1);
  const [current_total, setCurrenTotal] = useState(0);
  const [current_last_page, setCurrentLastPage] = useState(0);
  const [error, setError] = useState(false);
  const [estado, setEstado] = useState(true);
  const [currentInfo, setCurrentInfo] = useState({})
  const [option, setOption] = useState();
  const [currentContract, setCurrentContract] = useState({})
  const [isRefresh, setIsRefresh] = useState(false);
  
  const handleInputInfo = ({ options = [], value }) => {
    const current = options.find(c => c.value == value);
    setCurrentContract(current?.obj || {});
  }

  // obtener contratos
  const getInfos = async (add = false) => {
    setCurrentLoading(true);
    const params = new URLSearchParams();
    if (estado !== "") params.set('state', estado)
    await microPlanilla.get(`infos?limit=100&contractId=${currentContract.id}`, { params })
      .then(res => {
        const { items, meta } = res.data;
        setCurrentInfos(add ? [...current_infos, ...items] : items);
        setCurrenTotal(meta.totalItems || 0);
        setPage(meta.currentPage || 1);
        setCurrentLastPage(meta.totalPages || 0);
      }).catch(() => setError(true))
    setCurrentLoading(false);
  }

  const selectDefault = (options = []) => {
    const object = options[1] || {};
    setCurrentContract(object?.obj || {});
  }

  const handleEdit = (obj) => {
    setOption('EDIT')
    setCurrentInfo(obj);
  }

  useEffect(() => {
    if (currentContract?.id) getInfos();
  }, [currentContract]);

  useEffect(() => {
    if (isRefresh) getInfos();
  }, [isRefresh])

  useEffect(() => {
    if (isRefresh) setIsRefresh(false);
  }, [isRefresh]);

  // render
  return (
    <div className="row">
      <div className="col-md-12">
        <h5 className="ml-3">Listado configuración de pago</h5>
        <div className="col-md-6 col-lg-4 col-12 col-sm-12">
          <SelectWorkToContract
            onReady={selectDefault}
            workId={work.id}
            onChange={(e, obj) => handleInputInfo(obj)}
            value={`${currentContract?.id || ''}`}
            displayText={(data) => {
              return `${data?.typeCategory?.name} | ${data?.resolution} | ${moment(data?.dateOfResolution).format('DD/MM/YYYY')}`;
            }}
          />
        </div>
        <hr/>
      </div>
      
      <Show condicion={Object.keys(currentContract).length}>
        <div className="col-md-6 col-lg-4 col-sm-12 mb-2">
          <ItemContract info={currentContract} />
        </div>

        <div className='col-md-6 col-lg-8 col-sm-12 mb-2'>
          <div>
            Lista de pagos en planilla
            <hr />
          </div>
          {current_infos?.map((i, indexI) => 
            <div className="mb-3" key={`info-list-${i.id}-${indexI}`}>
              <ItemInfo info={i} 
                onEdit={() => handleEdit(i)}
              />
            </div>
          )}

          <Show condicion={current_loading}>
            <Placeholder/>
          </Show>
        </div>

        {/*  crear info */}
        <BtnFloat theme="btn-success"
          style={{ bottom: '50px' }}
          onClick={() => setOption("CREATE")}>
          <i className="fas fa-plus"></i>
        </BtnFloat>
      </Show>


      <Show condicion={option == 'CREATE'}>
        <CreateInfo 
          contract={currentContract}
          onClose={() => setOption()}
          onSave={() => {
            setIsRefresh(true)
            setOption()
          }}
          work={work}
        />
      </Show>

      <Show condicion={option == 'EDIT'}>
        <EditInfo 
          infoDefault={currentInfo}
          onClose={() => setOption()}
          work={work}
          contract={currentContract}
          onSave={() => setIsRefresh(true)}
        />
      </Show>
    </div>
  )
}

// export 
export default Infos;