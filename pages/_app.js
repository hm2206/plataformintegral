import React, { Fragment, createContext } from 'react'
import Head from 'next/head'
import App from 'next/app';
import LoaderPage from '../components/loaderPage';
import Sidebar from '../components/sidebar';
import Router from 'next/router';
import Navbar from '../components/navbar';
import { Content } from '../components/Utils';
import { AUTH } from '../services/auth';
import { app } from '../env.json';
import { authentication } from '../services/apis';
import Cookies from 'js-cookie';
import { clearStorage } from '../storage/clear';
import LoadingGlobal from '../components/loadingGlobal';

// config redux
import { Provider } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import initsStore from '../storage/store';

// component utils
import Show from '../components/show';
import Swal from 'sweetalert2';
import uid from 'uid';
import NotCurrent from '../components/notCurrent';
import NotInternet from '../components/notInternet';
import SkullContent from '../components/loaders/skullContent';


// config router
Router.onRouteChangeStart = () => {
  let loadingBrand = document.getElementById('loading-brand');
  loadingBrand.style.display = 'block';
}

// state pages
Router.onRouteChangeComplete = () => {
  let loadingBrand = document.getElementById('loading-brand');
  loadingBrand.style.display = 'none';
}

Router.onRouteChangeError = () => {
  let loadingBrand = document.getElementById('loading-brand');
  loadingBrand.style.display = 'none';
}


class MyApp extends App {

  static getInitialProps = async ({ Component, ctx, store }) => {
    let pageProps = {};
    let _app = {};
    let message = "";
    let is_render = false;
    // obterner el app client
    await authentication.get('app/me')
    .then(res => {
      let { success, message, app } = res.data;
      if (!success) throw new Error(message); 
      _app = app;
      is_render = true;
    }).catch(err => {
      message = err.message;
      _app = {};
      is_render = false;
    });
    // obtener auth
    let isLoggin = await AUTH(ctx) ? await AUTH(ctx) : false;
    // ejecutar initial de los children
    if (await Component.getInitialProps) {
      // props
     try {
        pageProps = await Component.getInitialProps(ctx)
        pageProps.isLoggin = isLoggin;
        pageProps.app = _app;
        // page
        return { pageProps, store, isLoggin, _app, is_render, message };
     } catch (error) {
        if (ctx.isServer) {
          ctx.res.writeHead(301, { location: '/404' });
          ctx.res.end();
          ctx.finished = true;
        } else history.go('/404')
     }
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      auth: {},
      activeTabKey: "",
      current: true,
      loading: false,
      is_render: false,
      toggle: false,
      screenY: 0,
      screenX: 0,
      screen_lg: false,
      refresh: false,
      online: true,
      config_entity: {
        render: false,
        disabled: false,
        entity_id: ""
      },
      entity_id: "",
      notification: {
        data: [],
        page: 1,
        total: 0,
        lastPage: 1
      },
      read: 0,
      no_read: 0
    }
    // add context
    this.LoadingProvider = createContext({
      loading : this.state.loading,
      setLoading : (value) => this.setState({ loading: value })
    });
  }

  componentDidMount = async () => {
    this.handleRequestAuth();
    window.onload = async () => {
      let tab = uid(16);
      await localStorage.setItem('activeTabKey', tab);
      await this.setState({ activeTabKey: tab });
      this.intervalo = setInterval(this.focusMeTab, 1000);
    };

    this.handleScreen();
    window.addEventListener('resize', this.handleScreen);
  }

  handleRequestAuth = () => {
    let { isLoggin } = this.props;
    if (isLoggin) {
      this.getAuth();
      this.getNotication();
    }
  }

  getAuth = async () => {
    authentication.get('me')
      .then(res => {
        let { success, message, user } = res.data;
        if (success) this.setState({ auth: user });
        else this.logout();
      })
      .catch(async err => console.log('error auth', err.message));
  }

  getNotication = (page = 1) => {
    authentication.get(`auth/notification?page=${page}`)
    .then(res => {
        let { success, message, notification, no_read } = res.data;
        if (!success) throw new Error(message);
        this.setState(state => {
            state.notification.page = notification.page;
            state.notification.total = notification.total;
            state.notification.lastPage = notification.lastPage;
            state.notification.data = [...state.notification.data, ...notification.data];
            return { notification: state.notification, no_read };
        });
    }).catch(err => console.log(err.message));
  }

  focusMeTab = async () => {
    let currentTab = await localStorage.getItem('activeTabKey');
    let isOnline = await navigator.onLine;
    let { online } = this.state;
    if (online != isOnline) this.setState({ online: isOnline });
    if (currentTab != this.state.activeTabKey) {
      this.setState({ current: false });
      clearInterval(this.intervalo);
    }
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.handleScreen);
    clearInterval(this.intervalo);
  }

  componentWillReceiveProps = (nextProps) => {
    let { pageProps } = this.props;
    if (nextProps.pageProps && pageProps.pathname != nextProps.pageProps.pathname) this.fireEntity({ render: false, disabled: false });
  } 

  componentDidCatch = (error, info) => {
    // Router.push({ pathname: "/error", query: { error: error }});
  }

  handleScreen = () => {
    this.setState({ screenX: window.innerWidth, screenY: window.innerHeight });
  }

  fireEntity = (config = this.state.config_entity) => {
    this.setState({ config_entity: config });
  }

  handleToggle = async () => {
    await this.setState(state => ({ toggle: !state.toggle }));
  }

  handleScreenLg = async (estado) => {
    await this.setState({ screen_lg: !this.state.screen_lg });
  }

  logout = async () => {
    let { store } = this.props;
    await authentication.post('logout')
      .then(async res => {
          let { success, message } = res.data;
          if (!success) throw new Error(message); 
          await clearStorage(store);
      }).catch(err => Swal.fire({ icon: 'error', text: err.message }));
    history.go('/login');
    await Cookies.remove('auth_token');
  }

  refreshProfile = async () => {
    this.setState({ refresh: true });
    this.setState({ refresh: false });
  }

  fireLoading = async (loading = true) => {
    await this.setState({ loading });
  }

  setAuth = (auth) => {
    this.setState({ auth });
  }

  render() {
    const { Component, pageProps, store, isLoggin, _app, is_render, message } = this.props
    const { loading, current, entity_id, auth, notification, no_read, read } = this.state;
    pageProps.auth = auth;
    pageProps.setAuth = this.setAuth;
    pageProps.notification = {
      notification, no_read, read
    };
    // is authenticado
    let isAuth = Object.keys(auth).length;

    return  <Fragment>
        <Provider store={store}>
          <Head>
            <meta charSet="utf-8"></meta>
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"></meta>
            <title>{_app.name || "Integración"}</title>
            <link rel="shortcut icon" href={_app.icon_images && _app.icon_images.icon_50x50}></link>
            <meta name="theme-color" content="#3063A0"></meta>
            <link href="https://fonts.googleapis.com/css?family=Roboto:400,300,100,500,600,700,900" rel="stylesheet" type="text/css" />
            <link rel="stylesheet" href="/css/open-iconic-bootstrap.min.css" />
            <link rel="stylesheet" href="/css/all.css" />
            <link rel="stylesheet" href="/css/buttons.bootstrap4.min.css"></link>
            <link rel="stylesheet" href="/css/flatpickr.min.css" />
            <link rel="stylesheet" href="/css/theme.min.css" data-skin="default" />
            <link rel="stylesheet" href="/css/theme-dark.min.css" data-skin="dark" disabled={true} />
            <link rel="stylesheet" href="/css/skull.css" />

            <script src="/js/jquery.min.js"></script>
            <script src="/js/popper.min.js"></script>
            <script src="/js/bootstrap.min.js"></script>
            {/* css dinamico */}
            <link rel="stylesheet" href={app.css || ""} />
            <link rel="stylesheet" href="/css/page_loading.css" />
            {!isLoggin ?  <link rel="stylesheet" href="/css/no_auth_page_loading.css" /> : null}
            {/* custom */}
            <link rel="stylesheet" href="/css/custom.css" />

            {/* WPA */}
            {/* <link rel="manifest" href="/manifest.json" />
            <link href='/favicon-16x16.png' rel='icon' type='image/png' sizes='16x16' />
            <link href='/favicon-32x32.png' rel='icon' type='image/png' sizes='32x32' />
            <link rel="apple-touch-icon" href="/apple-icon.png"></link>
            <meta name="theme-color" content="#346cb0"/> */}
            <script src="/js/stacked-menu.min.js"></script>
            <script src="/js/theme.min.js"></script>
          </Head>

          {/* precargar imagen */}
          <img src="/img/loading_page.png" style={{ display: 'none' }}/>  

          <div id="page_change"></div>

          <Show condicion={!is_render}>
            <LoaderPage message={message}/>
          </Show>

          <LoadingGlobal display="none" id="loading-brand"/>

          <Show condicion={is_render && this.state.loading}>
            <LoadingGlobal/>
          </Show>

          <Show condicion={!this.state.online}>
            <NotInternet my_app={_app}/>
          </Show>

          <Show condicion={is_render && !current}>
            <NotCurrent my_app={_app}/>
          </Show>
          
            <Show condicion={is_render && current}>

              {/* precargar imagen de la app */}
              <img src={_app.icon && _app.icon_images && _app.icon_images.icon_200x200 || '/img/base.png'} style={{ display: 'none' }}/>  
              {/* logica de page auth */}
              {
                isLoggin ?
                  <Fragment>
                    <div className="full-layout" id="main">
                      <div className="gx-app-layout ant-layout ant-layout-has-sider">
                        <div className="ant-layout">
                          {/* menu navbar */}
                          <Navbar onToggle={this.handleToggle} 
                            auth={auth}
                            my_app={_app} toggle={this.state.toggle} 
                            setScreenLg={this.handleScreenLg} 
                            screen_lg={this.state.screen_lg} 
                            screenX={this.state.screenX}
                            logout={this.logout}
                            config_entity={this.state.config_entity}
                            onFireEntityId={(e) => this.setState({ entity_id: e })}
                            notification={notification}
                            read={read}
                            no_read={no_read}
                          />
                          {/* content */}
                          <div className="gx-layout-content ant-layout-content">
                            <div className="gx-main-content-wrapper">
                              <Sidebar 
                                my_app={_app}
                                auth={auth} 
                                onToggle={this.handleToggle} 
                                toggle={this.state.toggle} 
                                screen_lg={this.state.screen_lg}
                                logout={this.logout}
                                refresh={this.state.refresh}
                              />
                              <Content screen_lg={this.state.screen_lg}>
                                  <Show condicion={isAuth}>
                                    <Component {...pageProps} 
                                      entity_id={entity_id}
                                      fireEntity={this.fireEntity}
                                      toggle={this.state.toggle} 
                                      screenX={this.state.screenX}
                                      my_app={_app}
                                      fireRefreshProfile={this.refreshProfile}
                                      fireLoading={this.fireLoading}
                                      isLoading={loading}
                                    />
                                  </Show>

                                  <Show condicion={!isAuth}>
                                    <div className="col-md-12">
                                      <SkullContent/>
                                    </div>
                                  </Show>
                              </Content>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`aside-backdrop ${this.state.toggle ? 'show' : ''}`}
                      onClick={this.handleToggle}
                    />
                  </Fragment>
                : <Component {...pageProps} 
                    my_app={_app} 
                    fireLoading={this.fireLoading}
                    isLoading={loading}
                  />
              }
            </Show>
        
        </Provider>
    </Fragment>
  }
}

export default withRedux(initsStore)(MyApp);