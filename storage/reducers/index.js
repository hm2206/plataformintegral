import { combineReducers } from 'redux';
import auth from './authReducer';
import work from './workReducer';
import cronograma from './cronogramaReducer';
import info from './infoReducer';
import cargo from './cargoReducer';
import historial from './historialReducer';

const rootReducer = combineReducers({
    auth,
    work,
    cronograma,
    info,
    cargo,
    historial,
});

export default rootReducer;