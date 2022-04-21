const Services = require("../../models/user/service");
const { catchErr } = require("../../error");

const createSubService = async (req, res) => {
  const {
    serviceId,
    name,
    type,
    status,
    description,
    BasePrice,
    averageTaskTime,
    peakhours,
    peakHourSurchargePercent,
    nextHourDiscountPercent,
  } = req.body;
  try {
    const ServicePrice = {
      minimum: req.body.ServicePriceMin,
      maximum: req.body.ServicePriceMax,
    };

    const responseWaitTime = {
      Defvalue: req.body.responseWaitTimeDef,
      maxvalue: req.body.responseWaitTimeMax,
      jumpvalue: req.body.responseWaitTimeJump,
    };

    const Estimatedtime = {
      Defvalue: req.body.EstimatedtimeDef,
      estimatedvalue: req.body.EstimatedtimeMax,
      jumpvalue: req.body.EstimatedtimeJump,
    };

    const addData = {
      serviceId,
      name,
      type: JSON.parse(type),
      description,
      status,
      imageUrl: req.file?.filename,
      ServicePrice,
      BasePrice,
      averageTaskTime,
      responseWaitTime,
      Estimatedtime,
      peakhours,
      peakHourSurchargePercent,
      nextHourDiscountPercent,
    };

    await Services.findByIdAndUpdate(serviceId, {
      $push: { subServices: addData },
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: "Subservice added successfully",
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const updateSubService = async (req, res) => {
  const {
    serviceId,
    subServiceId,
    name,
    type,
    status,
    description,
    BasePrice,
    averageTaskTime,
    peakhours,
    peakHourSurchargePercent,
    nextHourDiscountPercent,
  } = req.body;
  try {
    const ServicePrice = {
      minimum: req.body.ServicePriceMin,
      maximum: req.body.ServicePriceMax,
    };

    const responseWaitTime = {
      Defvalue: req.body.responseWaitTimeDef,
      maxvalue: req.body.responseWaitTimeMax,
      jumpvalue: req.body.responseWaitTimeJump,
    };

    const Estimatedtime = {
      Defvalue: req.body.EstimatedtimeDef,
      estimatedvalue: req.body.EstimatedtimeMax,
      jumpvalue: req.body.EstimatedtimeJump,
    };

    await Services.findOneAndUpdate(
      { _id: serviceId, subServices: { $elemMatch: { _id: subServiceId } } },
      {
        $set: {
          "subServices.$.name": name,
          "subServices.$.status": status,
          "subServices.$.type": JSON.parse(type),
          "subServices.$.description": description,
          "subServices.$.imageUrl": req.file?.filename,
          "subServices.$.BasePrice": BasePrice,
          "subServices.$.ServicePrice": ServicePrice,
          "subServices.$.averageTaskTime": averageTaskTime,
          "subServices.$.responseWaitTime": responseWaitTime,
          "subServices.$.Estimatedtime": Estimatedtime,
          "subServices.$.peakhours": peakhours,
          "subServices.$.peakHourSurchargePercent" : peakHourSurchargePercent,
          "subServices.$.nextHourDiscountPercent": nextHourDiscountPercent
        },
      },
      { new: false, safe: true, upsert: true }
    );

    const subservice = await Services.findOne({
      _id: serviceId,
      "subServices._id": subServiceId,
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      SubService: subservice,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const deleteSubService = async (req, res) => {
  try {
    const { serviceId, subServiceId } = req.body;

    if (!serviceId || !subServiceId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const subService = await Services.findOne({
      _id: serviceId,
      "subServices._id": subServiceId,
    });

    if (!subService) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }
    await Services.findOneAndUpdate(
      {
        _id: serviceId,
      },
      {
        $pull: {
          subServices: {
            _id: subServiceId,
          },
        },
      }
    );

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_35"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getSubServices = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const subService = await Services.findOne(
      { _id: serviceId },
      { subServices: 1 }
    );
    res.status(200).json({
      status: req.t("success_status"),
      subServices: subService,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getSubServiceDetils = async (req, res) => {
  try {
    const { serviceId, subServiceId } = req.body;
    const subService = await Services.findOne(
      { _id: serviceId },
      {
        subServices: { $elemMatch: { _id: subServiceId } },
      }
    );
    res.status(200).json({
      status: req.t("success_status"),
      subServices: subService,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

module.exports = {
  createSubService,
  updateSubService,
  deleteSubService,
  getSubServices,
  getSubServiceDetils,
};
