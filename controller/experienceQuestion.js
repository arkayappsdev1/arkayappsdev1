const Experience = require("../models/experienceQuestion");
const { catchErr } = require("../error");

// create experience question
// update experience question
// get list of experience question
// get single experience question
// delete experience question

const createExperienceQuestion = async (req, res) => {
  try {
    const { experienceQuestion } = req.body;
    const addQuestion = await Experience.create({ experienceQuestion });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: addQuestion,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const updateExperienceQuestion = async (req, res) => {
  try {
    const { questionId, question } = req.body;

    if (!questionId || !question) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    await Experience.findByIdAndUpdate(questionId, {
      experienceQuestion: question,
      updatedAt: Date.now(),
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_38"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const deleteExperienceQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Experience.findById(questionId);

    if (!question) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    await Experience.findByIdAndDelete(questionId);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_39"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

module.exports = {
  createExperienceQuestion,
  updateExperienceQuestion,
  deleteExperienceQuestion,
};
