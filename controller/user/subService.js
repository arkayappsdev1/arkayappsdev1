// const SubService = require("../../models/user/subService");
const Services = require("../../models/user/service");
const {catchErr} = require("../../error")

const getSubServices = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const findSubServices = await Services.findById(serviceId, {
      subServices: 1,
    });

    const filteredService = await findSubServices.subServices.filter(service => service.status === 1)
    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      subServices: filteredService,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req))
  }
};

const getSubService = async (req, res) => {
  try {
    const { serviceId, subServiceId } = req.body;
    const findSubService = await Services.findOne(
      { _id: serviceId },
      {
        subServices: { $elemMatch: { _id: subServiceId } },
      }
    );
    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: {
        subServices : findSubService.subServices[0]
      },
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req))
  }
};

const subServiceSearch = async (req, res) => {
  try {
    const { serviceId, search } = req.query;
    if (!serviceId) {
      return res.status(200).json({
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const findSubServices = await Services.findById(serviceId, {
      subServices: 1,
    });

    let newArray = [];
    await findSubServices.subServices.map((x) => x.name.includes(search) && newArray.push(x));
    res.status(200).json({
      status: req.t("success_status"),
      data: newArray,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req))
  }
};

module.exports = {
  getSubServices,
  getSubService,
  subServiceSearch,
};
