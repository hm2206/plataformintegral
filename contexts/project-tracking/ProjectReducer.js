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
    team: {
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
    ADD_OBJECTIVE: 'ADD[OBJECTIVE]',
    SET_ACTIVITIES: 'SET[ACTIVITIES]',
    UPDATE_ACTIVITY: 'UPDATE[ACTIVITY]',
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
            let deleteAreas = newState.areas.data.filter(d => d.id != payload);
            newState.areas.data = deleteAreas;
            newState.areas.total = state.areas.total - 1; 
            return newState;
        case projectTypes.SET_OBJECTIVES:
            let newObjectives = Object.assign(state.objectives, payload);
            newState.objectives = newObjectives;
            return newState;
        case projectTypes.ADD_OBJECTIVE:
            let addObjectives = Object.assign({}, state.objectives);
            addObjectives.data = addObjectives.data.filter(obj => obj.id != payload.id);
            addObjectives.data.push(payload);
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
            updateActivity.data[indexUpdateActivity] = payload;
            newState.activities = updateActivity;
            // response state
            return newState;
        default:
            return newState;
    }
}
