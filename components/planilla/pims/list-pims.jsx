import React, { useEffect, useContext } from 'react';
import { EntityContext } from '../../../contexts/EntityContext';
import BoardSimple from '../../boardSimple';
import { BtnFloat } from '../../Utils';
import Show from '../../show';
import { useState } from 'react';
import CreatePim from './create-pim';
import { Button, Input } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import { format } from 'currency-formatter';
import EditPim from './edit-pim';
import ChangePim from './change-pim';
import CalcPim from './calc-pim';

const ListPims = ({ pim, pathname, query }) => {

  const entity_context = useContext(EntityContext);
  const router = useRouter();

  const [isEntry, setIsEntry] = useState(false);
  const [option, setOption] = useState();
  const [year, setYear] = useState(query.year);
  const [currentPim, setCurrentPim] = useState(undefined);

  const handleSearch = () => {
    query.year = year;
    router.push({ pathname, query });
  }

  const handleDoubleClick = (obj = {}) => {
    setOption('EDIT');
    setCurrentPim(obj);
  }

  const handleSave = () => {
    setOption();
    handleSearch();
  }

  const handleChangePim = (pim, isEntry) => {
    setCurrentPim(pim);
    setOption('CHANGE');
    setIsEntry(isEntry)
  }

  useEffect(() => {
    entity_context.fireEntity({ render: true });
    return () => entity_context.fireEntity({ render: false });
  }, []);

  return (
    <dic className="col-md-12">
      <BoardSimple
        prefix="P"
        bg="danger"
        options={[]}
        title="PIM"
        info={["Lista de Pim anual"]}
      >
        <div className="col-12 mt-3">
          <div className="card">
            <div className="card-header">
              <div className="row">
                <div className="col-md-4 col-12 mb-2">
                  <Input type='number'
                    fluid
                    name="year"
                    value={year}
                    onChange={(e, data) => setYear(data.value)}
                  />
                </div>
                <div className="col-12 col-md-4 mb-2">
                  <Button basic
                    color='primary'
                    onClick={handleSearch}
                  >
                    <i className="fas fa-search"></i>
                  </Button>

                  <CalcPim year={year}
                    onCalc={handleSearch}
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="text-right">
                <b><u>(Doble click para editar)</u></b>
              </div>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Código</th>
                    <th>Año</th>
                    <th>Meta</th>
                    <th>Partición Presp.</th>
                    <th>Extensión Presp.</th>
                    <th className='text-right'>Monto</th>
                    <th className='text-right'>Executado</th>
                    <th className='text-right'>Saldo</th>
                    <th className='text-center'>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pim?.items?.map(item => 
                    <tr onDoubleClick={() => handleDoubleClick(item)}>
                      <td className='cursor-pointer'>{item?.id}</td>
                      <td className='cursor-pointer'>{item?.code}</td>
                      <td className='cursor-pointer'>{item?.year}</td>
                      <td className='cursor-pointer'>{item?.meta?.name}</td>
                      <td className='cursor-pointer'>{item?.cargo?.name}</td>
                      <td className='cursor-pointer'>{item?.cargo?.extension}</td>
                      <td className='text-right cursor-pointer'>
                        <b>{format(item?.amount, { code: 'PEN' })}</b>
                      </td>
                      <td className='text-right cursor-pointer'>
                        <b>{format(item?.executedAmount, { code: 'PEN' })}</b>
                      </td>
                      <td className='text-right cursor-pointer'>
                        <b>{format(item?.diffAmount, { code: 'PEN' })}</b>
                      </td>
                      <td className='text-center'>
                        <span className='text-success mr-2 cursor-pointer'
                          title='Aumentar Presupuesto'
                          onClick={() => handleChangePim(item, true)}
                        >
                          <i className="fas fa-plus"></i>
                        </span>
                        <span className='text-danger ml-2 cursor-pointer'
                          title='Quitar Presupuesto'
                          onClick={() => handleChangePim(item, false)}
                        >
                          <i className="fas fa-minus"></i>
                        </span>
                      </td>
                    </tr>  
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </BoardSimple>
      {/* btn para crear pims*/}
      <BtnFloat onClick={() => setOption('CREATE')}>
        <i className="fas fa-plus"></i>
      </BtnFloat>
      {/* crear pims */}
      <Show condicion={option == 'CREATE'}>
        <CreatePim year={year}
          onClose={() => setOption()}
          onSave={handleSave}
        />
      </Show>
      {/* edit pims */}
      <Show condicion={option == 'EDIT'}>
        <EditPim
          onClose={() => setOption()}
          pim={currentPim}
          onSave={handleSearch}
        />
      </Show>
      {/* change pims max */}
      <Show condicion={option == 'CHANGE'}>
        <ChangePim
          pim={currentPim}
          isEntry={isEntry}
          onClose={() => setOption()}
          onSave={() => {
            setOption();
            handleSearch();
          }}
        />
      </Show>
    </dic>
  )
}

export default ListPims;