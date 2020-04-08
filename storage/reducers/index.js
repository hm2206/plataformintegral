import { combineReducers } from 'redux';
import auth from './authReducer';
import work from './workReducer';
import cronograma from './cronogramaReducer';

const rootReducer = combineReducers({
    auth,
    work,
    cronograma
});

export default rootReducer;