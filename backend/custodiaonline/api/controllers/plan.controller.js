"use strict";
const _ = require("lodash");

const planService = require("../service/plan.service");
var controllerHelper = require('../helpers/controller.helper');

// Module Name
const MODULE_NAME = '[Plan Controller]';

const createPlan = async(req, res) => {

    planService.createPlan(req)
        .then(plan => {
            res.status(201).json({
                ok: true,
                plan: plan
            })
        })
        .catch(error => {
            controllerHelper.handleErrorResponse(MODULE_NAME, createPlan.name, error, res);
        });

};

const updatePlanById = async(req, res) => {
    
    const params = {
        id: req.swagger.params.id.value,
        ...req.body
    };

    
    planService.updatePlanById(params)
        .then(plan => {
            res.status(201).json({
                ok: true,
                plan: plan
            })
        })
        .catch(error => {
            controllerHelper.handleErrorResponse(MODULE_NAME, updatePlanById.name, error, res);
        });
};


const deletePlanById = async(req, res) => {
    const params = {
        id: req.swagger.params.id.value,
        ...req.body
    };

    planService.deletePlanById(params)
        .then(itemnumber => {
            res.status(201).json({
                ok: true,
                numberOfItemsDeleted: itemnumber
            })
        })
        .catch(error => {
            controllerHelper.handleErrorResponse(MODULE_NAME, deletePlanById.name, error, res);
        });
};

const getPlanById = async(req, res) => {

    const params = {
        id: req.swagger.params.id.value,
        ...req.body
    };

    planService.getPlanById(params)
        .then(plan => {
            res.status(200).json({
                ok: true,
                plan: plan
            })
        })
        .catch(error => {
            controllerHelper.handleErrorResponse(MODULE_NAME, creagetPlanByIdtePlan.name, error, res);
        });
};

const getPlans = async(req, res) => {

    planService.getPlans()
        .then(plan => {
            res.status(200).json({
                ok: true,
                plan: plan
            })
        })
        .catch(error => {
            controllerHelper.handleErrorResponse(MODULE_NAME, getPlans.name, error, res);
        });
};


module.exports = {
    createPlan,
    updatePlanById,
    deletePlanById,
    getPlanById,
    getPlans
};