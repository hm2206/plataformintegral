import React, { Fragment, createContext } from 'react'
import Head from 'next/head'
import App from 'next/app';
import LoaderPage from '../components/loaderPage';
import Sidebar from '../components/sidebar';
import Router from 'next/router';
import Navbar from '../components/navbar';
import { Content } from '../components/Utils';
import { AUTH } from '../services/auth';
import { getAuth, authsActionsTypes } from '../storage/actions/authsActions';
import { app } from '../env.json';
import { authentication } from '../services/apis';
import Cookies from 'js-cookie';
import { clearStorage } from '../storage/clear';
import LoadingGlobal from '../components/loadingGlobal';

// config redux
import { Provider } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import initsStore from '../storage/store';
import Show from '../components/show';
import Swal from 'sweetalert2';
import uid from 'uid';
import NotCurrent from '../components/notCurrent';

// config context
import { AppProvider, LoadingProvider } from '../contexts';

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
      if (isLoggin) {
        await ctx.store.dispatch(getAuth(ctx));
      } else {
        await ctx.store.dispatch({ type: authsActionsTypes.LOGOUT });
      }
      // props
     try {
        pageProps = await Component.getInitialProps(ctx)
        let { user } = await ctx.store.getState().auth
        pageProps.auth = user;
        pageProps.isLoggin = isLoggin;
        pageProps.app = _app;
        // page
        return { pageProps, store, isLoggin, _app, is_render, message };
     } catch (error) {
        if (ctx && ctx.res) {
          ctx.res.writeHead(301, { location: '/404' });
          ctx.res.end();
          ctx.finished = true;
        }
     }
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      activeTabKey: "",
      current: true,
      loading: false,
      is_render: false,
      toggle: false,
      screenY: 0,
      screenX: 0,
      screen_lg: false,
      refresh: false,
      config_entity: {
        render: false,
        disabled: false,
        entity_id: ""
      }
    }
    // add context
    this.LoadingProvider = createContext({
      loading : this.state.loading,
      setLoading : (value) => this.setState({ loading: value })
    });
  }

  focusMeTab = async () => {
    let currentTab = await localStorage.getItem('activeTabKey');
    if (currentTab != this.state.activeTabKey) {
      this.setState({ current: false });
      clearInterval(this.intervalo);
    }
  }

  componentDidMount = () => {
    window.onload = async () => {
      let tab = uid(16);
      await localStorage.setItem('activeTabKey', tab);
      await this.setState({ activeTabKey: tab });
      this.intervalo = setInterval(this.focusMeTab, 1000);
    };

    this.handleScreen();
    window.addEventListener('resize', this.handleScreen);
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.handleScreen);
    clearInterval(this.intervalo);
  }

  componentWillReceiveProps = (nextProps) => {
    let { pageProps } = this.props;
    if (nextProps.pathname && pageProps.pathname != nextProps.pageProps.pathname) this.fireEntity({ render: false, disabled: false });
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
    this.setState({ loading });
  }

  render() {
    const { Component, pageProps, store, isLoggin, _app, is_render, message } = this.props
    const { loading, current } = this.state;

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
            <link rel="manifest" href="/manifest.json" />
            <link href='/favicon-16x16.png' rel='icon' type='image/png' sizes='16x16' />
            <link href='/favicon-32x32.png' rel='icon' type='image/png' sizes='32x32' />
            <link rel="apple-touch-icon" href="/apple-icon.png"></link>
            <meta name="theme-color" content="#346cb0"/>
            <script src="/js/stacked-menu.min.js"></script>
            <script src="/js/theme.min.js"></script>
          </Head>

          <div id="page_change"></div>

          <Show condicion={!is_render}>
            <LoaderPage message={message}/>
          </Show>

          <Show condicion={is_render}>
            <LoadingGlobal display={loading ? 'block' : 'none'}/>
          </Show>

          <Show condicion={is_render && !current}>
            <NotCurrent my_app={_app}/>
          </Show>
          
          <LoadingProvider value={{ 
              isLoading: this.state.loading,
              setLoading: (value) => this.setState({ loading: value })
           }}>
            <Show condicion={is_render && current}>
              {
                isLoggin ?
                  <Fragment>
                    <div className="full-layout" id="main">
                      <div className="gx-app-layout ant-layout ant-layout-has-sider">
                        <div className="ant-layout">
                          {/* menu navbar */}
                          <Navbar onToggle={this.handleToggle} 
                            my_app={_app} toggle={this.state.toggle} 
                            setScreenLg={this.handleScreenLg} 
                            screen_lg={this.state.screen_lg} 
                            screenX={this.state.screenX}
                            logout={this.logout}
                            config_entity={this.state.config_entity}
                          />
                          {/* content */}
                          <div className="gx-layout-content ant-layout-content">
                            <div className="gx-main-content-wrapper">
                              <Sidebar 
                                my_app={_app} 
                                onToggle={this.handleToggle} 
                                toggle={this.state.toggle} 
                                screen_lg={this.state.screen_lg}
                                logout={this.logout}
                                refresh={this.state.refresh}
                              />
                              <Content screen_lg={this.state.screen_lg}>
                                  <Component {...pageProps} 
                                    fireEntity={this.fireEntity}
                                    toggle={this.state.toggle} 
                                    screenX={this.state.screenX}
                                    my_app={_app}
                                    fireRefreshProfile={this.refreshProfile}
                                    fireLoading={this.fireLoading}
                                    isLoading={loading}
                                  />
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
          </LoadingProvider>
        
        </Provider>
    </Fragment>
  }
}

export default withRedux(initsStore)(MyApp);