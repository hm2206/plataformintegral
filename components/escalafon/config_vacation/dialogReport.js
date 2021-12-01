import React, { useState, useContext } from 'react';
import Modal from '../../modal';
import WorkProvider from '../../../providers/escalafon/WorkProvider';
import { SelectDefault } from '../../select/default'
import { Confirm } from '../../../services/utils';
import { Button } from 'semantic-ui-react';
import { escalafon } from '../../../services/apis';
import { Collection } from 'collect.js';
import { AppContext } from '../../../contexts/AppContext';
import Swal from 'sweetalert2';

const DialogReport = ({ work, onClose = null, onFile = null }) => {

  // app
  const app_context = useContext(AppContext);

  const workProvider = new WorkProvider();

  const [years, setYears] = useState([]);

  const handleInput = (e, values) => {
    const newYears = new Collection(values).pluck('value').toArray();
    setYears(newYears);
  }

  const handleReport = async (type = 'pdf', extname = 'pdf') => {
    let answer = await Confirm('info', `¿Estas seguro en generar el reporte de vacaciones?`, 'Generar');
    if (!answer) return;
    app_context.setCurrentLoading(true);
    await workProvider.reportVacations(work.id, { type, year: years })
    .then(res => {
        app_context.setCurrentLoading(false);
        let file = new File([res.data], `reporte-vacacion.${extname}`);
        let url = URL.createObjectURL(res.data);
        const fileEmber = {
          name: file.name,
          extname: extname,
          url,
          size: file?.size
        }
        // enviar archivo
        if (typeof onFile == 'function') onFile(fileEmber);
    }).catch(() => {
        app_context.setCurrentLoading(false);
        Swal.fire({ icon: 'error', text: 'No se pudó generar el reporte' });
    })
  }

  return (
    <Modal isClose={onClose}
      show={true}
      md="5"
      height="50%"
      titulo={<span><i className="fas fa-file-alt"></i> Reporte</span>}
    >
      <div className='card-body'>
        <div className='form-group'>
          <SelectDefault
            execute={true}
            api={escalafon}
            url={`works/${work?.id}/config_vacations`}
            id={`work-item-${work?.id}`}
            text="year"
            value='year'
            isMulti
            obj="config_vacations"
            onChange={handleInput}
          />
        </div>
        <div className='row mt-5 justify-content-center'>
          <div className='col-md-3 col-6'>
            <Button color='red'
              onClick={() => handleReport('pdf', 'pdf')}
              fluid
            >
              <i className='fas fa-file-pdf'></i> PDF
            </Button>
          </div>

          <div className='col-md-3 col-6'>
            <Button color='green'
              onClick={() => handleReport('excel', 'xlsx')}
              fluid
            >
              <i className='fas fa-file-excel'></i> EXCEL
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default DialogReport;