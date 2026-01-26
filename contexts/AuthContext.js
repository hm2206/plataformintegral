import { createContext, useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import { Content } from "../components/Utils";
import { EntityProvider } from "../contexts/EntityContext";
import { SocketProvider } from "../contexts/SocketContext";
import { NotificationProvider } from "../contexts/notification/NotificationContext";
import Cookies from "js-cookie";

// Valor por defecto para evitar undefined cuando se usa fuera del provider
const defaultAuthValue = {
  auth: {},
  setAuth: () => {},
  logout: () => {},
  is_logged: false,
  loading: true,
  token: null,
};

export const AuthContext = createContext(defaultAuthValue);

// Loader de pantalla completa - definido fuera del componente
const AuthLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      flexDirection: "column",
      gap: "20px",
      background: "linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)",
    }}
  >
    <style>{`
            @keyframes authSpin {
                to { transform: rotate(360deg); }
            }
        `}</style>
    <div
      style={{
        width: "50px",
        height: "50px",
        border: "3px solid #e2e8f0",
        borderTopColor: "#346cb0",
        borderRadius: "50%",
        animation: "authSpin 0.8s linear infinite",
      }}
    />
    <p
      style={{
        margin: 0,
        fontSize: "14px",
        color: "#718096",
        fontWeight: "500",
      }}
    >
      Verificando sesión...
    </p>
  </div>
);

export const AuthProvider = ({ children }) => {
  // estados
  const [auth, setAuth] = useState({});
  const [token, setToken] = useState(null);

  // auth context
  const { getAuth, logout, is_logged, loading, removeToken } = useAuth();

  // obtener el auth
  const handleAuth = async () => {
    let authTemp = await getAuth();
    setAuth(authTemp);
  };

  const recoveryToken = () => {
    setToken(Cookies.get("auth_token") || null);
  };

  // executar el auth
  useEffect(() => {
    handleAuth();
    recoveryToken();
  }, []);

  // no se pudo loggear
  useEffect(() => {
    if (typeof is_logged == "boolean" && !is_logged) {
      removeToken();
      location.href = "/login";
    }
  }, [is_logged]);

  // Si está cargando o no está logueado, mostrar loader
  if (loading || is_logged !== true) {
    return <AuthLoader />;
  }

  // response - solo se muestra cuando está autenticado
  return (
    <AuthContext.Provider
      value={{ logout, is_logged, auth, setAuth, loading, token }}
    >
      <EntityProvider>
        <SocketProvider>
          <NotificationProvider>
            {/* navbar */}
            <Navbar />
            {/* sidebar */}
            <Sidebar />
            {/* pages auth */}
            <Content>{children}</Content>
          </NotificationProvider>
        </SocketProvider>
      </EntityProvider>
    </AuthContext.Provider>
  );
};
