import { combineReducers } from 'redux';
import auth from './authReducer';
import work from './workReducer';

const rootReducer = combineReducers({
    auth,
    work,
});

export default rootReducer;