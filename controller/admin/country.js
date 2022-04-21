const Country = require("../../models/country");
const { catchErr } = require("../../error");

const addCountry = async (req, res) => {
  const { countryName, countryCode, requireDocument, documentList } = req.body;
  try {
    const countryData = {
      countryName,
      countryCode,
      requireDocument,
      documentList,
    };
    const newCountry = await Country.create(countryData);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: newCountry,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const updateCountry = async (req, res) => {
  try {
    const { id, countryName, countryCode, requireDocument, documentList } =
      req.body;

    await Country.findByIdAndUpdate(id, {
      countryName,
      countryCode,
      requireDocument,
      documentList,
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: "Data updated successfully",
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const countryList = async (req, res) => {
  try {
    const list = await Country.find();

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: list,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const deleteCountry = async (req, res) => {
  try {
    const { id } = req.query;

    await Country.findByIdAndDelete(id);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_41"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getCountry = async (req, res) => {
  try {
    const { id } = req.query;

    const country = await Country.findById(id);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: country,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

module.exports = {
  addCountry,
  countryList,
  deleteCountry,
  updateCountry,
  getCountry,
};
