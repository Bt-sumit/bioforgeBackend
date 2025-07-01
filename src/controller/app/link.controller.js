    const linkService = require('../../service/app/link.service');
    const statusCodes = require("../../helper/statusCodes");
    const responseHelper = require("../../helper/response");
    const linkModel = require('../../model/link.model');
    const { default: mongoose } = require('mongoose');
    const userModel = require('../../model/user.model');
    const addLinksValidation = require('../../validation/app/addlink.validation')
    class linksController {

        add = async (request, response) => {
            try { 
            // const { error } = await addLinksValidation.add(request.body,);
            // const validationError = responseHelper.validatIonError(response, error);
            // if (validationError) return;
                const result = await linkService.add(request);
                return responseHelper.success(response, "Link added successfully", result, statusCodes.OK);
            } catch (error) {
                console.error("Add Link Error:", error);
                return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
            }
        };
        update = async (request, response) => {
            try {
                const data = await linkService.update(request);
                return responseHelper.success(response, `link updated successfully`, null, statusCodes.OK)
            } catch (error) {
                console.log(error);
                return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
            }
        }
        delete = async (request, response) => {
            try {
                const linkData = await linkModel.findOne({ _id: new mongoose.Types.ObjectId(request?.query?._id), is_deleted: '0' });
                if (!linkData) {
                    return responseHelper.Forbidden(response, `link not found`, null, statusCodes.OK)
                }
                const data = await linkService.delete(request);
                return responseHelper.success(response, `link deleted successfully`, null, statusCodes.OK);
            } catch (error) {
                console.log(error);
                return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR)
            }
        }
        updateStatus = async (request, response) => {
            try {
                const data = await linkService.updateStatus(request);
                return responseHelper.success(response, `link status updated successfully`, null, statusCodes.OK)
            } catch (error) {
                console.log(error);
                return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
            }
        }
        getAll = async (request, response) => {
            try {
                const data = await linkService.get(request)
                return responseHelper.success(response, `All links fetched successfully`, data, statusCodes.OK)
            } catch (error) {
                console.log(error);
                return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
            }
        }   
        updateIndex = async (request, response) => {
            try {
                // const linkData = await linkModel.findOne({_id:request?.body?._id,is_deleted:'0'});
                // if(!linkData){
                //     return responseHelper.Forbidden(response, `link not found`, null, statusCodes.OK)
                // }
                const data = await linkService.updateIndex(request);
                return responseHelper.success(response, `link index updated successfully`, null, statusCodes.OK)
            } catch (error) {
                console.log(error);
                return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
            }
        }
    }

    module.exports = new linksController