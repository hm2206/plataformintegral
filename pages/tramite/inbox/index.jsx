import React, { useContext, useEffect, useReducer } from "react";
import Router, { useRouter } from "next/router";
import { TramiteSocketProvider } from "../../../contexts/sockets/TramiteSocket";
import Show from "../../../components/show";
import { SelectAuthEntityDependencia } from "../../../components/select/authentication";
import CreateTramite from "../../../components/tramite/createTramite";
import { AUTHENTICATE } from "../../../services/auth";
import InboxShow from "../../../components/tramite/inboxShow";
import InboxMenu from "../../../components/tramite/inboxMenu";
import InboxTab from "../../../components/tramite/inboxTab";
import {
  TramiteProvider,
  TramiteContext,
} from "../../../contexts/tramite/TramiteContext";
import dynamic from "next/dynamic";
import { EntityContext } from "../../../contexts/EntityContext";
import { AuthContext } from "../../../contexts/AuthContext";
import { tramiteTypes } from "../../../contexts/tramite/TramiteReducer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Visualizador = dynamic(() => import("../../../components/visualizador"), {
  ssr: false,
});

const reducer = (state, { type, payload }) => {
  let newState = Object.assign({}, state);
  switch (type) {
    case "SET_DEPENDENCIA_ID":
      newState.dependencia_id = payload;
      return newState;
    default:
      return newState;
  }
};

const InboxContent = () => {
  const router = useRouter();
  const { pathname, query } = router;
  const { auth } = useContext(AuthContext);
  const entity_context = useContext(EntityContext);
  const tramite_context = useContext(TramiteContext);
  const {
    dispatch,
    setOption,
    setNext,
    setPage,
    setIsSearch,
    setQuerySearch,
    online,
    menu,
  } = tramite_context;
  const [state, currentDispatch] = useReducer(reducer, { dependencia_id: "" });

  const handleDependencia = ({ value }) => {
    query.dependencia_id = value;
    currentDispatch({ type: "SET_DEPENDENCIA_ID", payload: value });
    router.push({ pathname, query });
  };

  const dependenciaDefault = (dependencias = []) => {
    if (!query.dependencia_id) {
      let isAllow = dependencias.length;
      if (isAllow >= 2) {
        let current_dependencia = dependencias[1];
        query.dependencia_id = current_dependencia.value;
        currentDispatch({
          type: "SET_DEPENDENCIA_ID",
          payload: query.dependencia_id,
        });
        Router.push({ pathname, query });
      }
    }
  };

  const handleOnSave = (tramite) => {
    setOption([]);
    setPage(1);
    if (menu != "SENT") {
      setIsSearch(true);
      dispatch({ type: tramiteTypes.CHANGE_MENU, payload: "SENT" });
    } else {
      if (!online) setIsSearch(true);
    }
    dispatch({
      type: tramiteTypes.CHANGE_TRACKING,
      payload: tramite?.tracking || {},
    });
    dispatch({ type: tramiteTypes.CHANGE_RENDER, payload: "SHOW" });
    dispatch({ type: tramiteTypes.DECREMENT_FILTRO, payload: "SENT" });
  };

  const handleFileObservation = (file) => {
    if (tramite_context.render == "TAB") setIsSearch(true);
    else dispatch({ type: tramiteTypes.UPDATE_FILE_TRACKING, payload: file });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setIsSearch(true);
  };

  return (
    <>
      {/* Header compacto tipo Gmail */}
      <div className="tw-bg-white tw-border-b tw-border-gray-200 tw-px-3 tw-py-1.5">
        <div className="tw-flex tw-items-center tw-gap-2">
          {/* Selector de dependencia */}
          <div className="tw-flex-shrink-0 inbox-dependencia-selector">
            <style>{`
                            .inbox-dependencia-selector .ui.selection.dropdown {
                                min-width: 200px;
                                max-width: 260px;
                                min-height: 32px !important;
                                padding: 6px 28px 6px 10px !important;
                                border: 1px solid #e5e7eb !important;
                                border-radius: 8px !important;
                                background: #f9fafb !important;
                                font-size: 13px !important;
                                transition: all 0.15s ease;
                            }
                            .inbox-dependencia-selector .ui.selection.dropdown:hover {
                                border-color: #d1d5db !important;
                                background: #f3f4f6 !important;
                            }
                            .inbox-dependencia-selector .ui.selection.dropdown:focus,
                            .inbox-dependencia-selector .ui.selection.dropdown.active {
                                border-color: #346cb0 !important;
                                box-shadow: 0 0 0 3px rgba(52, 108, 176, 0.1) !important;
                            }
                            .inbox-dependencia-selector .ui.selection.dropdown > .text {
                                color: #374151 !important;
                                font-weight: 500 !important;
                                white-space: nowrap !important;
                                overflow: hidden !important;
                                text-overflow: ellipsis !important;
                                display: block !important;
                                max-width: 100% !important;
                            }
                            .inbox-dependencia-selector .ui.selection.dropdown > .default.text {
                                color: #9ca3af !important;
                                font-weight: 400 !important;
                            }
                            .inbox-dependencia-selector .ui.selection.dropdown > .dropdown.icon {
                                color: #6b7280 !important;
                                top: 50% !important;
                                transform: translateY(-50%) !important;
                                margin-top: 0 !important;
                                right: 10px !important;
                            }
                            .inbox-dependencia-selector .ui.selection.dropdown .menu {
                                border-radius: 8px !important;
                                margin-top: 4px !important;
                                border: 1px solid #e5e7eb !important;
                                box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
                                background: white !important;
                                max-width: 350px !important;
                            }
                            .inbox-dependencia-selector .ui.selection.dropdown .menu > .item {
                                font-size: 13px !important;
                                padding: 10px 12px !important;
                                color: #374151 !important;
                                background: white !important;
                            }
                            .inbox-dependencia-selector .ui.selection.dropdown .menu > .item:hover {
                                background: #f3f4f6 !important;
                                color: #346cb0 !important;
                            }
                            .inbox-dependencia-selector .ui.selection.dropdown .menu > .item.selected {
                                background: #eff6ff !important;
                                color: #346cb0 !important;
                                font-weight: 500 !important;
                            }
                            .inbox-dependencia-selector .ui.selection.dropdown .menu > .item .text {
                                color: #374151 !important;
                            }
                            .inbox-dependencia-selector .ui.selection.dropdown .menu > .item:hover .text,
                            .inbox-dependencia-selector .ui.selection.dropdown .menu > .item.selected .text {
                                color: #346cb0 !important;
                            }
                        `}</style>
            <SelectAuthEntityDependencia
              onReady={dependenciaDefault}
              entity_id={entity_context.entity_id}
              name="dependencia_id"
              onChange={(e, obj) => handleDependencia(obj)}
              value={query.dependencia_id || ""}
              disabled={tramite_context.current_loading}
            />
          </div>

          {/* Barra de búsqueda */}
          <form
            onSubmit={handleSearch}
            className="tw-flex-1 tw-flex tw-items-center tw-gap-2"
          >
            <div className="tw-relative tw-flex-1 tw-max-w-xl">
              <i className="fas fa-search tw-absolute tw-left-2.5 tw-top-1/2 -tw-translate-y-1/2 tw-text-gray-400 tw-text-xs"></i>
              <Input
                type="text"
                placeholder="Buscar por código, documento..."
                value={tramite_context.query_search || ""}
                onChange={({ target }) => setQuerySearch(target.value)}
                disabled={tramite_context.current_loading}
                className="tw-pl-8 tw-h-8 tw-text-sm tw-bg-gray-100 tw-border-0 tw-rounded-lg focus:tw-bg-white focus:tw-ring-2 focus:tw-ring-primary-500"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={tramite_context.current_loading}
              className="tw-h-8 tw-px-3 tw-text-xs tw-bg-primary-500 hover:tw-bg-primary-600"
            >
              Buscar
            </Button>
          </form>

          {/* Botón crear */}
          <Show condicion={tramite_context.render == "TAB"}>
            <Button
              onClick={() => {
                setNext("");
                setOption(["CREATE"]);
              }}
              size="sm"
              className="tw-h-8 tw-bg-gradient-to-r tw-from-primary-500 tw-to-primary-600 tw-shadow-sm hover:tw-shadow-md tw-gap-1.5"
            >
              <i className="fas fa-plus tw-text-[10px]"></i>
              <span className="tw-hidden sm:tw-inline tw-text-xs">Nuevo</span>
            </Button>
          </Show>
        </div>
      </div>

      {/* Contenido principal */}
      <Show
        condicion={query.dependencia_id}
        predeterminado={
          <div className="tw-flex tw-items-center tw-justify-center tw-h-64">
            <div className="tw-text-center tw-text-gray-500">
              <i className="fas fa-building tw-text-4xl tw-mb-3 tw-text-gray-300"></i>
              <p>Seleccione una dependencia para continuar</p>
            </div>
          </div>
        }
      >
        <div className="tw-flex" style={{ height: "calc(100vh - 110px)" }}>
          {/* Sidebar menu */}
          <InboxMenu dependencia_id={query.dependencia_id} />

          {/* Contenido */}
          <div className="tw-flex-1 tw-overflow-hidden tw-bg-white tw-border-r tw-border-gray-200">
            <Show condicion={tramite_context.render == "TAB"}>
              <InboxTab />
            </Show>
            <Show condicion={tramite_context.render == "SHOW"}>
              <div className="tw-h-full tw-overflow-y-auto">
                <InboxShow />
              </div>
            </Show>
          </div>
        </div>
      </Show>

      {/* Modals */}
      <CreateTramite
        show={tramite_context.option.includes("CREATE")}
        isClose={() => setOption([])}
        user={
          tramite_context.tab == "DEPENDENCIA"
            ? tramite_context.boss.user
            : auth || {}
        }
        onSave={handleOnSave}
      />

      <Show condicion={tramite_context.option.includes("VISUALIZADOR")}>
        <Visualizador
          id={tramite_context.file?.id || "_error"}
          observation={tramite_context.file?.observation || ""}
          name={tramite_context.file?.name || ""}
          extname={tramite_context.file?.extname || ""}
          url={tramite_context.file?.url || ""}
          onClose={() => setOption([])}
          onUpdate={handleFileObservation}
        />
      </Show>
    </>
  );
};

const InboxIndex = ({ success, role, boss }) => {
  const router = useRouter();
  const { pathname, query } = router;
  const entity_context = useContext(EntityContext);
  const isRole = role ? Object.keys(role).length : 0;

  const getRole = () => {
    const roles = {
      BOSS: { text: "Jefe", variant: "default" },
      SECRETARY: { text: "Secretaria", variant: "warning" },
      DEFAULT: { text: "Trabajador", variant: "secondary" },
    };
    return isRole ? roles[role.level] : roles["DEFAULT"];
  };

  useEffect(() => {
    entity_context.fireEntity({ render: true });
    return () => entity_context.fireEntity({ render: false });
  }, []);

  return (
    <TramiteSocketProvider>
      <TramiteProvider
        dependencia_id={query?.dependencia_id || ""}
        role={role}
        boss={boss}
      >
        <div className="col-12 tw-p-1">
          <div className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-border tw-border-gray-200 tw-overflow-hidden">
            {/* Header */}
            <div className="tw-bg-white tw-border-b tw-border-gray-200 tw-px-3 tw-py-1.5 tw-flex tw-items-center tw-justify-between">
              <div className="tw-flex tw-items-center tw-gap-2">
                <div className="tw-w-6 tw-h-6 tw-bg-red-500 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                  <i className="fas fa-inbox tw-text-white tw-text-[10px]"></i>
                </div>
                <h1 className="tw-text-sm tw-font-semibold tw-text-gray-900 tw-m-0">
                  Bandeja de Entrada
                </h1>
              </div>
              <Badge
                variant={getRole().variant}
                className="tw-text-[10px] tw-px-2 tw-py-0.5"
              >
                {getRole().text}
              </Badge>
            </div>

            {/* Content */}
            <InboxContent />
          </div>
        </div>
      </TramiteProvider>
    </TramiteSocketProvider>
  );
};

export default InboxIndex;
