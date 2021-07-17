import React, { useState } from 'react';
import ItemSchedulesBallot from './itemSchedulesBallot';
import Show from '../../show'
import moment from 'moment';
import { SelectWorkInfo } from '../../select/escalafon';
import collect from 'collect.js';
import ItemInfo from '../infos/itemInfo';
moment.locale('es');


const Ballots = ({ work }) => {

    // estados
    const [current_info, setCurrentInfo] = useState({});

    const handleInfo = (e, { value, options }) => {
        let plucked = collect(options).pluck('value').toArray();
        let index = plucked.indexOf(value);
        if (index < 0) return; 
        let obj = options[index];
        setCurrentInfo(obj?.obj || {});
    }

    // render
    return <div className="row">
        <div className="col-md-12">
            <h5 className="ml-3">Listado de Papeletas</h5>
            <hr/>
        </div>

        <div className="col-md-4">
            <SelectWorkInfo
                defaultValue={1}
                onDefaultValue={({obj}) => setCurrentInfo(obj)}
                principal={1}
                work_id={work?.id}
                name="info"
                value={current_info?.id}
                onChange={handleInfo}
            />
        </div>

        <div className="col-12 mb-4"></div>

        <Show condicion={current_info?.id}>
            <div className="col-md-4">
                <ItemInfo info={current_info}/>
            </div>
    
            <div className="col-md-8">
                <ItemSchedulesBallot info={current_info}/>
            </div>
        </Show>
    </div>
}

// export 
export default Ballots;