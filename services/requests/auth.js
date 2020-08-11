import { authentication } from '../apis';


export const getAuth = async (ctx) => {
    return await authentication.get('me', {}, ctx)
      .then(res => res.data)
      .catch(async err => ({
          success: false,
          message: err.message,
          code: 'ERR',
          user: {}
      }));
}