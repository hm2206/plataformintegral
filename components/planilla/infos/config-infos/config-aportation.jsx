import React, { useMemo, useState } from 'react';
import Modal from '../../../modal';
import { Button } from 'semantic-ui-react';
import { SelectTypeAportation, SelectPim } from '../../../select/micro-planilla';
import { microPlanilla } from '../../../../services/apis';
import { useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import Show from '../../../show';
import { Confirm } from '../../../../services/utils';
import Swal from 'sweetalert2';

const Placeholder = () => {
  const data = [1, 2, 3, 4];
  return data.map(d => 
    <tr>
      <td><Skeleton/></td>
      <td><Skeleton /></td>
      <td><Skeleton/></td>
    </tr>
  );  
}

const ItemTypeAportation = ({ infoTypeAportation = {}, onDelete = null }) => {

  const { typeAportation, pim } = infoTypeAportation;

  const [option, setOption] = useState("");
  const [currentLoading, setCurrentLoading] = useState(false);

  const events = {
    DELETE: "DELETE"
  }

  const handleDelete = async () => {
    const answer = await Confirm('warning', `¿Estás seguro en eliminar los regístros?`);
    if (!answer) return;
    setOption(events.DELETE);
    setCurrentLoading(true);
    await microPlanilla.delete(`infoTypeAportations/${infoTypeAportation.id}`)
      .then(() => {
        Swal.fire({
          icon: 'success',
          text: 'Los datos se eliminaron correctamente!'
        })
        // send event
        if (typeof onDelete == 'function') onDelete();
      }).catch(() => Swal.fire({
        icon: 'error',
        text: 'No se pudo eliminar los datos'
      }))
    setCurrentLoading(false);
  }

  return (
    <tr>
      <td>
        <span className='badge badge-dark mr-2'>{typeAportation?.code}</span>
        <b>{typeAportation?.name}</b> 
        <i className="fas fa-arrow-right ml-2 mr-2"></i>
        <span className='badge badge-primary'>{typeAportation.percent}%</span>
      </td>
      <td>
        Meta {pim?.code || ''} - {pim?.cargo?.name || ''} [{pim.cargo?.extension || ''}]
      </td>
      <td className='text-center'>
        <Button.Group size='mini'>
          <Button color='red'
            disabled={currentLoading}
            loading={(currentLoading && option == events.DELETE)}
            onClick={handleDelete}
          >
            <i className="fas fa-trash"></i>
          </Button>
        </Button.Group>
      </td>
    </tr>
  )
}

const CreateTypeAportation = ({ info = {}, onSave = null }) => {

  const [currentLoading, setCurrentLoading] = useState(false);
  const [form, setForm] = useState({});

  const isCan = useMemo(() => {
    return form?.typeAportationId;
  }, [form]);

  const handleInput = ({ name, value }) => {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const handleIntToInput = ({ name, value }) => {
    const newValue = parseInt(`${value}`);
    handleInput({ name, value: newValue });
  }

  const handleSave = async () => {
    const answer = await Confirm('warning', `¿Estás seguro en guardar los datos?`);
    if (!answer) return;
    setCurrentLoading(true);
    const payload = Object.assign({}, form);
    payload.infoId = info.id;
    await microPlanilla.post(`infoTypeAportations`, payload)
      .then(res => {
        Swal.fire({
          icon: 'success',
          text: 'Los datos se guardaron correctamente!'
        });
        // on event
        if (typeof onSave == 'function') onSave(res.data);
        // clear form
        setForm({ amount: 0, isBase: true });
      }).catch(() => Swal.fire({ 
        icon: 'error',
        text: 'No se pudo guardar los datos'
      }))
    // disabled loading
    setCurrentLoading(false);
  }

  return (
    <tr>
      <td width="30%">
        <SelectTypeAportation
          name="typeAportationId"
          value={form?.typeAportationId}
          onChange={(e, obj) => handleIntToInput(obj)}
          disabled={currentLoading}
        />
      </td>
      <td width="40%">
        <SelectPim
          name="pimId"
          year={new Date().getFullYear()}
          value={form?.pimId}
          onChange={(e, obj) => handleIntToInput(obj)}
          disabled={currentLoading}
        />
      </td>
      <td className='text-center' width="30%">
        <Button color='teal'
          disabled={!isCan || currentLoading}
          onClick={handleSave}
          loading={currentLoading}
        >
          <i className="fas fa-save"></i> Guardar
        </Button>
      </td>
    </tr>
  )
}

const ConfigAportation = ({ info = {}, onClose = null, onSave = null }) => {

  const [current_loading, setCurrentLoading] = useState(false);
  const [currentMeta, setCurrentMeta] = useState({});
  const [currentData, setCurrentData] = useState([]);
  const [isRefresh, setIsRefresh] = useState(false);

  const getData = async (add = false) => {
    setCurrentLoading(true);
    await microPlanilla.get(`infos/${info.id}/typeAportations?limit=100`)
      .then(res => {
        const { meta, items } = res.data;
        setCurrentMeta(meta)
        setCurrentData(prev => add ? [...prev, ...items] : items)
      }).catch(err => console.log(err))
    setCurrentLoading(false);
  }

  const handleSave = () => {
    if (typeof onSave == 'function') onSave();
    setIsRefresh(true)
  }

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (isRefresh) getData();
  }, [isRefresh]);

  useEffect(() => {
    if (isRefresh) setIsRefresh(false);
  }, [isRefresh]);

  return (
    <Modal show={true}
      isClose={onClose}
      md="10 col-sm-10 col-11"
      height="50%"
      disabled={current_loading}
      titulo={<span><i className="fas fa-cogs"></i> Configuración de Aportación Empleador</span>}
    >
      <div className="card-body">
        <table className='table table-striped'>
          <thead>
            <tr>
              <th width="35%">Aportación</th>
              <th width="40%">Extensión</th>
              <th className='text-center'>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {/* crear remuneraciones */}
            <CreateTypeAportation
              onSave={handleSave}
              info={info}
            />
            {/* listar remuneraciones */}
            {currentData.map((d, index) => 
              <ItemTypeAportation
                key={`list-item-type-aportation-${index}`}
                infoTypeAportation={d}
                onDelete={() => setIsRefresh(true)}
              />
            )}
            {/* loading */}
            <Show condicion={current_loading}>
              <Placeholder/>
            </Show>
          </tbody>
        </table>
      </div>
    </Modal>
  )
}

export default ConfigAportation;