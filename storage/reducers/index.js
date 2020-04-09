import { combineReducers } from 'redux';
import auth from './authReducer';
import work from './workReducer';
import cronograma from './cronogramaReducer';
import info from './infoReducer';

const rootReducer = combineReducers({
    auth,
    work,
    cronograma,
    info
});

export default rootReducer;