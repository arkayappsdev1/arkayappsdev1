const Users = require("../../models/user/Users");
const { catchErr } = require("../../error");

// need to add find user functionality
const userList = async (req, res) => {
  try {
    const { userNature } = req.query;

    if (userNature === "consumer" || userNature === "provider") {
      const users = await Users.find(
        { userNature },
        {
          firstName: 1,
          lastName: 1,
          languagePreference: 1,
          status: 1,
          gender: 1,
          userNature: 1,
          CreatedAt: 1,
          mobileNumber: 1,
          document: 1,
          "categories._id" : 1,
        }
      );

      return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        data: users,
      });
    }

    res.status(404).json({
      statusCode: 400,
      status: req.t("failure_status"),
      message: req.t("failure_message_5"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findById(userId);

    if (!user) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: user,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId, status, documentApprovalStatus } = req.body;

    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    await Users.findByIdAndUpdate(userId, { status, documentApprovalStatus });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_47"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getCatagory = async (req, res) => {
  try {
    const { userId, catagoryId } = req.query;
    if (!userId || !catagoryId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const catagory = await Users.findOne(
      { _id: userId },
      {
        categories: { $elemMatch: { _id: catagoryId } },
      }
    );

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: catagory.categories[0],
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const deleteCatagory = async (req, res) => {
  try {
    const { userId, catagoryId } = req.query;

    if (!userId || !catagoryId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    await Users.findOneAndUpdate(
      { _id: userId },
      {
        $pull: { categories: { _id: catagoryId } },
      },
      { safe: true, multi: true }
    );

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_48"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const updateCatagory = async (req, res) => {
  try {
    const { userId, catagoryId, active, approvalStatus } = req.body;

    if (!userId || !catagoryId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    await Users.findOneAndUpdate(
      { _id: userId, categories: { $elemMatch: { _id: catagoryId } } },
      {
        $set: {
          "categories.$.active": active,
          "categories.$.approvalStatus": approvalStatus,
        },
      },
      { new: false, safe: true, upsert: true }
    );

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_49"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getCatagoryDocument = async (req, res) => {
  try {
    const { categoryId, providerId, label } = req.body;

    const document = await Users.findOne(
      { _id: providerId },
      {
        categories: {
          $elemMatch: {
            _id: categoryId,
          },
        },
      }
    );

    const doc = document?.categories[0]?.categoryDocuments?.filter(
      (doc) => doc.label === label
    );

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: doc[0],
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const updateDocument = async (req, res) => {
  try {
    const { For, providerId, docName, docId, expireDate, categoryId } =
      req.body;

    if (For === "country") {
      await Users.findOneAndUpdate(
        { _id: providerId, document: { $elemMatch: { _id: docId } } },
        {
          $set: {
            "document.$.docName": docName,
            "document.$.expire_date": expireDate,
          },
        },
        { new: false, safe: true, upsert: true }
      );

      return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        massage: "Document successfully updated",
      });
    }

    if (For === "service") {
      await Users.updateOne(
        { _id: providerId },
        {
          $set: {
            "categories.$[outer].categoryDocuments.$[inner].docName": docName,
            "categories.$[outer].categoryDocuments.$[inner].expire_date" : expireDate
          },
        },
        {
          arrayFilters: [{ "outer._id": categoryId }, { "inner._id": docId }]
        }
      );
    }

    return res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      massage: "Document successfully updated",
    });

    // await Users.update(
    //   { _id: providerId },
    //   {
    //     "categories.$.categoryDocuments"
    //   }
    // );

    res.send("done");
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findById(userId);

    if (!user) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    await Users.findByIdAndDelete(userId);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_37"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

module.exports = {
  userList,
  getUser,
  deleteUser,
  getCatagory,
  updateUser,
  deleteCatagory,
  updateCatagory,
  getCatagoryDocument,
  updateDocument,
};
