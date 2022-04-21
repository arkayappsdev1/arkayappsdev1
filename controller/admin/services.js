const Services = require("../../models/user/service");
const { catchErr } = require("../../error");

const createService = async (req, res) => {
  try {
    const {
      name,
      type,
      country,
      vicinity,
      status,
      docRequirement,
      documentList,
    } = req.body;

    if (!name || !type || !country || !vicinity || !status) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    const newService = await Services.create({
      name,
      type: JSON.parse(type),
      country,
      vicinity: JSON.parse(vicinity),
      status,
      imageUrl: req.file?.filename,
      docRequirement,
      documentList: JSON.parse(documentList),
    });

    res.status(201).json({
      statusCode: 201,
      status: req.t("success_status"),
      data: newService,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const updateService = async (req, res) => {
  const {
    serviceId,
    name,
    type,
    country,
    vicinity,
    status,
    docRequirement,
    documentList,
  } = req.body;
  try {
    if (!serviceId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const service = await Services.findById(serviceId);

    if (!service) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    await Services.findByIdAndUpdate(serviceId, {
      name,
      type: JSON.parse(type),
      country,
      vicinity: JSON.parse(vicinity),
      status,
      imageUrl: req.file?.filename,
      docRequirement,
      documentList: JSON.parse(documentList),
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: "Service updated successfully",
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getServices = async (req, res) => {
  const { country, search } = req.query;
  try {
    let name = new RegExp(search, "i");
    if (country === "all") {
      const service = await Services.find().select("-subServices");

      return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        data: {
          services: service,
        },
      });
    }

    const allServices = await Services.find({ country, name }).select(
      "-subServices"
    );

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: {
        services: allServices,
      },
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.query;

    if (!serviceId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    await Services.findByIdAndDelete(serviceId);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_34"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

// search service include from controller/user/home

module.exports = { createService, updateService, getServices, deleteService };
