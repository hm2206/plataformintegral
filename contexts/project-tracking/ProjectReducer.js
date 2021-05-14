import React from 'react';
import collect from 'collect.js';

export const inititalStates = {
    project: {},
    financiamiento: {
        total_monetario: 0,
        total_no_monetario: 0,
        total_porcentaje_monetario: 0,
        total_porcentaje_no_monetario: 0,
        total: 0,
        data: [],
    },
    areas: {
        page: 1,
        last_page: 0,
        total: 0,
        data: []
    },
    objectives: {
        page: 1,
        last_page: 0,
        total: 0,
        data: []
    },
    activities: {
        page: 1,
        last_page: 0,
        total: 0,
        data: []
    },
    gastos: {
        page: 1,
        last_page: 0,
        total: 0,
        data: []
    },
    teams: {
        page: 1,
        last_page: 0,
        total: 0,
        data: []
    },
    plan_trabajos: {
        page: 1,
        last_page: 0,
        total: 0,
        data: []
    }
}

export const projectTypes = {
    SET_PROJECT: 'SET[PROJECT]',
    SET_FINANCIAMIENTOS: 'SET[FINANCIAMIENTOS]',
    SET_AREAS: 'SET[AREAS]',
    DELETE_AREA: 'DELETE[AREA]',
    SET_OBJECTIVES: 'SET[OBJECTIVES]',
    UPDATE_OBJECTIVE: 'UPDATE[OBJECTIVE]',
    ADD_OBJECTIVE: 'ADD[OBJECTIVE]',
    SET_ACTIVITIES: 'SET[ACTIVITIES]',
    UPDATE_ACTIVITY: 'UPDATE[ACTIVITY]',
    SET_GASTOS: 'SET[GASTOS]',
    ADD_GASTO: 'ADD[GASTO',
    UPDATE_GASTO: 'UPDATE[GASTO]',
    DELETE_GASTO: 'DELETE_GASTO',
    VERIFY_TECNICA: 'VERIFY_TECNICA',
    SET_TEAMS: 'SET[TEAMS]',
    ADD_TEAM: 'ADD[TEAM]',
    DELETE_TEAM: 'DELETE[TEAM]',
    SET_PLAN_TRABAJOS: 'SET[PLAN_TRABAJOS]',
    ADD_PLAN_TRABAJO: 'SET[PLAN_TRABAJO]',  
};

export const projectReducer = (state = inititalStates, { type, payload }) => {
    let newState = Object.assign({}, state);
    switch (type) {
        case projectTypes.SET_PROJECT:
            newState.project = payload;
            return newState;
        case projectTypes.SET_FINANCIAMIENTOS:
            let newFinanciamientos = Object.assign(state.financiamiento, payload);
            newState.financiamiento = newFinanciamientos;
            return newState;
        case projectTypes.SET_AREAS:
            let newAreas = Object.assign(state.areas, payload);
            newState.areas = newAreas;
            return newState;
        case projectTypes.DELETE_AREA:
            let deleteAreas = newState.areas.data.filter(d => d.id != payload.id);
            newState.areas.data = deleteAreas;
            newState.areas.total = state.areas.total - 1; 
            return newState;
        case projectTypes.SET_OBJECTIVES:
            let newObjectives = Object.assign(state.objectives, payload);
            newState.objectives = newObjectives;
            return newState;
        case projectTypes.UPDATE_OBJECTIVE:
            let updateObjective = Object.assign({}, state.objectives);
            let indexUpdateObjective = collect(updateObjective.data).pluck('id').toArray().indexOf(payload.id);
            if (indexUpdateObjective < 0) return newState;
            let currentUpdateObjective = updateObjective.data[indexUpdateObjective];
            currentUpdateObjective = Object.assign(currentUpdateObjective, payload);
            updateObjective.data[indexUpdateObjective] = currentUpdateObjective;
            newState.objectives = updateObjective;
            return newState;
        case projectTypes.ADD_OBJECTIVE:
            let addObjectives = Object.assign({}, state.objectives);
            addObjectives.data = addObjectives.data.filter(obj => obj.id != payload.id);
            addObjectives.data.push(payload);
            addObjectives.total += 1;
            newState.objectives = addObjectives;
            return newState;
        case projectTypes.SET_ACTIVITIES:
            let newActivities = Object.assign(state.activities, payload);
            newState.activities = newActivities;
            return newState;
        case projectTypes.UPDATE_ACTIVITY:
            let updateActivity = Object.assign({}, state.activities);
            let indexUpdateActivity = collect(updateActivity.data).pluck('id').toArray().indexOf(payload.id);
            if (indexUpdateActivity < 0) return newState;
            let currentUpdateActivity = updateActivity.data[indexUpdateActivity];
            currentUpdateActivity = Object.assign(currentUpdateActivity, payload);
            updateActivity.data[indexUpdateActivity] = currentUpdateActivity;
            newState.activities = updateActivity;
            // obtener el total
            let objective_total = collect(newState.activities.data).sum('total');
            let payloadUpdateObjective = { id: currentUpdateActivity.objective_id, total: objective_total };
            projectReducer(state, { type: projectTypes.UPDATE_OBJECTIVE, payload: payloadUpdateObjective });
            // response state
            return newState;
        case projectTypes.SET_GASTOS:
            let newGastos = Object.assign(state.gastos, payload);
            newState.gastos = newGastos;
            return newState;
        case projectTypes.UPDATE_GASTO:
            let updateGasto = Object.assign({}, state.gastos);
            let indexUpdateGasto = collect(updateGasto.data).pluck('id').toArray().indexOf(payload.id);
            if (indexUpdateGasto < 0) return newState;
            let currentUpdateGasto = updateGasto.data[indexUpdateGasto];
            currentUpdateGasto = Object.assign(currentUpdateGasto, payload);
            updateGasto[indexUpdateGasto] = currentUpdateGasto;
            newState.gastos = updateGasto;
            // obtener el total
            let activity_total = collect(newState.gastos.data).sum('total');
            let payloadUpdateActivity = { id: currentUpdateGasto.activity_id, total: activity_total };
            projectReducer(state, { type: projectTypes.UPDATE_ACTIVITY, payload: payloadUpdateActivity });
            // response state
            return newState;
        case projectTypes.ADD_GASTO:
            let addGastos = Object.assign({}, state.gastos);
            addGastos.data = addGastos.data.filter(obj => obj.id != payload.id);
            addGastos.data.push(payload);
            newState.gastos = addGastos;
            let add_total_activity = collect(newState.gastos.data).sum('total');
            let payloadAddActivity = { id: payload.activity_id, total: add_total_activity, verify: 0, verify_tecnica: 0 };
            projectReducer(state, { type: projectTypes.UPDATE_ACTIVITY, payload: payloadAddActivity });
            return newState;
        case projectTypes.DELETE_GASTO:
            let deleteGastos = newState.gastos.data.filter(d => d.id != payload.id);
            newState.gastos.data = deleteGastos;
            newState.gastos.total = state.gastos.total - 1;
            let delete_total_activity = collect(newState.gastos.data).sum('total');
            let payloadDeleteActivity = { id: payload.activity_id, total: delete_total_activity };
            projectReducer(state, { type: projectTypes.UPDATE_ACTIVITY, payload: payloadDeleteActivity });
            return newState;
        case projectTypes.SET_TEAMS: 
            let newTeams = Object.assign(state.teams, payload);
            newState.teams = newTeams;
            return newState;
        case projectTypes.ADD_TEAM:
            let addTeams = Object.assign({}, state.teams);
            addTeams.data = addTeams.data.filter(obj => obj.id != payload.id);
            addTeams.data.push(payload);
            newState.teams = addTeams;
            return newState;
        case projectTypes.DELETE_TEAM:
            let deleteTeams = newState.teams.data.filter(d => d.id != payload.id);
            newState.teams.data = deleteTeams;
            newState.teams.total = state.teams.total - 1; 
            return newState;
        case projectTypes.SET_PLAN_TRABAJOS:
            let newPlanTrabajos = Object.assign(state.plan_trabajos, payload);
            newState.plan_trabajos = newPlanTrabajos;
            return newState;
        case projectTypes.ADD_PLAN_TRABAJO:
            let addPlanTrabajos = Object.assign({}, state.plan_trabajos);
            addPlanTrabajos.data = addPlanTrabajos.data.filter(obj => obj.id != payload.id);
            addPlanTrabajos.data.push(payload);
            addPlanTrabajos.total += 1;
            newState.plan_trabajos = addPlanTrabajos;
            return newState;
        default:
            return newState;
    }
}
