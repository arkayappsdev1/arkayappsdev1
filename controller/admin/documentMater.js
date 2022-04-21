const Document = require("../../models/documetMaster");
const { catchErr } = require("../../error");

const getDocumentMaster = async (req, res) => {
  try {
    const { documentFor } = req.query;
    const getDocList = await Document.find({});

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: getDocList,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const addDocumentsInMaster = async (req, res) => {
  try {
    const { documentFor, documentName, expireDate } = req.body;

    const newDoc = await Document.create({documentFor, documentName, expireDate});

    res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        message: newDoc
    })
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const updateDocumentInMaster = async (req, res) => {
    try {
        const { docId ,documentFor, documentName, expireDate } = req.body;

        await Document.findByIdAndUpdate(docId, {documentFor, documentName, expireDate})

        res.status(200).json({
            statusCode: 200,
            status: req.t("success_status"),
            message: "Master document successfully updated"
        })
    } catch (err) {
        res.status(500).json(catchErr(err, req));
    }
}

const deleteDocumentInMaster = async (req, res) => {
    try {
        const { docId } = req.query;

        await Document.findByIdAndDelete(docId);

        res.status(200).json({
            statusCode: 200,
            status: req.t("success_status"),
            message: "Document successfully deleted in master"
        })
    } catch (err) {
        res.status(500).json(catchErr(err, req));
    }
}

module.exports = { getDocumentMaster, addDocumentsInMaster, updateDocumentInMaster, deleteDocumentInMaster };
