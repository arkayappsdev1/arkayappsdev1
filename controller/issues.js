const Issue = require('../models/issues')
const {catchErr} = require("../error")

// create experience question
// update experience question
// get list of experience question
// get single experience question
// delete experience question


const createIssueQuestion = async (req, res) => {
    
    try{
        const {issueQuestion} = req.body;
        const addQuestion = await Issue.create({issueQuestion})

        res.status(200).json({
            statusCode: 200,
            status: req.t("success_status"),
            data: addQuestion
        })
    } catch (err) {
        res.status(500).json(catchErr(err, req))
    }
}

const updateIssueQuestion = (req, res) => {
    res.send(req.t("working_route"))
}

const deleteIssueQuestion = (req, res) => {
    res.send(req.t("working_route"))
}

module.exports = {
    createIssueQuestion,
    updateIssueQuestion,
    deleteIssueQuestion
}