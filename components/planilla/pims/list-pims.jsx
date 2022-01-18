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

const ListPims = ({ pim, pathname, query }) => {

  const entity_context = useContext(EntityContext);
  const router = useRouter();

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
                <div className="col-md-4 col-10 mb-2">
                  <Input type='number'
                    fluid
                    name="year"
                    value={year}
                    onChange={(e, data) => setYear(data.value)}
                  />
                </div>
                <div className="col-2 mb-2">
                  <Button basic
                    color='primary'
                    onClick={handleSearch}
                  >
                    <i className="fas fa-search"></i>
                  </Button>
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
                  </tr>
                </thead>
                <tbody>
                  {pim?.items?.map(item => 
                    <tr className='cursor-pointer'
                      onDoubleClick={() => handleDoubleClick(item)}
                    >
                      <td>{item?.id}</td>
                      <td>{item?.code}</td>
                      <td>{item?.year}</td>
                      <td>{item?.meta?.name}</td>
                      <td>{item?.cargo?.name}</td>
                      <td>{item?.cargo?.extension}</td>
                      <td className='text-right'>
                        <b>{format(item?.amount, { code: 'PEN' })}</b>
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
        />
      </Show>
    </dic>
  )
}

export default ListPims;