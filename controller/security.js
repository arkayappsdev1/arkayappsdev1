const SecurityQue = require("../models/security");
const {catchErr} = require("../error")

const getListOfSecurityQuestions = async (req, res) => {
  try{
      const data = await SecurityQue.find().select("-__v");
      res.status(200).json({
            statusCode: 400,
            status: req.t("success_status"),
            data
      })
  }catch(err){
    res.status(500).json(catchErr(err, req))
  }
};

const addSecuretyQuestions = async (req, res) => {
  const { question } = req.body;
  try {
    if (!question) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_29"),
      });
    }

    const existQue = await SecurityQue.findOne({question});

    if (existQue) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("exist_status"),
        message: req.t("exist_message_1"),
      });
    }

    await SecurityQue.create({question});

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_24"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req))
  }
};

const updateSecurityQuestion = async (req, res) => {
  try{
    const {questionId, question} = req.body;

    if(!questionId || !question){
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2") 
      })
    }

    await SecurityQue.findByIdAndUpdate(questionId, {"question" : question})

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_38") 
    })
  } catch (err) {
    res.status(500).json(catchErr(err, req))
  }
}

const deleteSecurityQuestion = async (req, res) => {
  try{
    const {questionId} = req.params;

    const question = await SecurityQue.findById(questionId);

    if(!question){
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      })
    }

    await SecurityQue.findByIdAndDelete(questionId)

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_39") 
    })
  } catch (err) {
    res.status(500).json(catchErr(err, req))
  }
}

module.exports = { getListOfSecurityQuestions, addSecuretyQuestions, updateSecurityQuestion, deleteSecurityQuestion };
