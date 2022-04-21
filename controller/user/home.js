const Services = require("../../models/user/service");
const Banners = require("../../models/banner");
// const Country = require("../../models/country");
const { catchErr } = require("../../error");

// get All Services
const getServices = async (req, res) => {
  const { country } = req.body;
  try {
    const allServices = await Services.find({ country, status: 1 })

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: allServices,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};


const getPopularServices = async (req, res) => {
  const { country } = req.body;
  try {
    const allServices = await Services.find({ country, status: 1 })

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: allServices,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
}

// get Individial Sevice
const getService = async (req, res) => {
  const { serviceId } = req.params;
  try {
    const service = await Services.findById(serviceId);
    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: {
        service,
      },
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

// get All Banners
const getBanners = async (req, res) => {
  try {
    const { country } = req.body

    // if (!country) {
    //   return res.status(400).json({
    //     statusCode: 400,
    //     status: req.t("failure_status"),
    //     message: 
    //   })
    // }

    const addBanner = await Banners.find({ status: 1 , country}).select("-__v");

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: addBanner,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const searchServices = async (req, res) => {
  try {
    const { country, search } = req.query;
    let name = new RegExp(search, "i");
    if (!country) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_1"),
      });
    }

    const searchData = await Services.find({ country, name, status: 1 }).select(
      "-__v"
    );

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      services: searchData,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

module.exports = {
  getServices,
  getService,
  getBanners,
  searchServices,
  getPopularServices
};
