const Users = require("../../models/user/Users");
const Service = require("../../models/user/service");
const { catchErr } = require("../../error");

const setupCatagory = async (req, res) => {
  try {
    const {
      categoryName,
      providerId,
      serviceId,
      subServiceId,
      hourlyRate,
      serviceRadius,
      nextHourDiscount,
      peakHourSurcharge,
      genderPreference,
      servicePreference,
      taskDuration,
      experience,
      saveForLater,
      active,
      helpNow
    } = req.body;

    if (
      !providerId ||
      !serviceId ||
      !subServiceId ||
      !hourlyRate ||
      !serviceRadius
    ) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    const consumer = await Users.findById(providerId);

    const existCategories = await Users.findOne(
      { _id: providerId },
      {
        categories: { $elemMatch: { "subService.subServiceId": subServiceId } },
      }
    );

    if (existCategories.categories.length !== 0) {
      if(existCategories.categories[0].approvalStatus === "saveForLater" && saveForLater === "false"){
        await Users.findOneAndUpdate(
          { _id: providerId, categories: { $elemMatch: { "subService.subServiceId": subServiceId } } },
          {
            $set: {
              "categories.$.saveForLater" : saveForLater,
              "categories.$.approvalStatus" : "pending"
            },
          },
          { new: false, safe: true, upsert: true }
        );
      }

      await Users.findOneAndUpdate(
        { _id: providerId, categories: { $elemMatch: { "subService.subServiceId": subServiceId } } },
        {
          $set: {
            "categories.$.active": active,
            "categories.$.helpNow": helpNow,
          },
        },
        { new: false, safe: true, upsert: true }
      );

      const newExistCategories = await Users.findOne(
        { _id: providerId },
        {
          categories: { $elemMatch: { "subService.subServiceId": subServiceId } },
        }
      );

      return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        // message: "Catagory successfully updated",
        data : {
          category : newExistCategories.categories[0]
        }
      });
    }

    const findSubService = await Service.findOne(
      { _id: serviceId },
      {
        name: 1,
        imageUrl: 1,
        subServices: { $elemMatch: { _id: subServiceId } },
      }
    );
    if (!consumer || findSubService.subServices.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    let Arrayof = [];
    let files = req.files;

    await files?.map((file) =>
      Arrayof.push({
        categoryDocumet: file.filename,
        label: file.filename.replace(/\.[^/.]+$/, ""),
      })
    );

    const newObj = {
      categoryName,
      service: {
        serviceId,
        name: findSubService.name,
        imageUrl: findSubService.imageUrl || null,
      },
      subService: {
        subServiceId,
        name: findSubService.subServices[0].name,
        imageUrl: findSubService.subServices[0].imageUrl,
      },
      categoryDocuments: Arrayof,
      hourlyRate,
      serviceRadius,
      nextHourDiscount,
      peakHourSurcharge,
      genderPreference,
      servicePreference,
      taskDuration,
      experience,
      saveForLater,
      approvalStatus : saveForLater === "true" ? "saveForLater" : "pending",
      helpNow
      // active: isActive
    };

    await Users.findByIdAndUpdate(providerId, {
      $push: { categories: newObj },
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_44"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getCatagoryList = async (req, res) => {
  try {
    const { providerId } = req.query;

    if (!providerId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const provider = await Users.findById(providerId, { categories: 1 });

    if (!provider) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    res.status(200).json({
      statusCode: 200,
      status: req.t("failure_status"),
      data: provider,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getCatagoryDetails = async (req, res) => {
  try {
    const {providerId, subServiceId} = req.body;

    const categoey = await Users.findOne(
      { _id: providerId },
      {
        categories: { $elemMatch: { "subService.subServiceId": subServiceId } },
      }
    );

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: {
        serviceCategory : categoey?.categories[0]
      }
    })

  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
}

// const changeCategoryStatus = async (req, res) => {
//   try {
//     const { providerId ,subServiceId, active, helpNow } = req.body;

//     if (!providerId || !subServiceId) {
//       return res.status(400).json({
//         statusCode: 400,
//         status: req.t("failure_status"),
//         message: req.t("failure_message_6"),
//       });
//     }

//     // const findCat = await Users.findOne(
//     //   { _id: providerId, categories: { $elemMatch: { "subService.subServiceId": subServiceId } } },
//     //   {
//     //       "categories.$": 1,
//     //   }
//     // );

//     // if(findCat.categories[0].approvalStatus === false) {
//     //   return res.status(400).json({
//     //     statusCode: 400,
//     //     status: req.t("failure_status"),
//     //     message: "Admin approval is pending"
//     //   })
//     // }

//     await Users.findOneAndUpdate(
//       { _id: providerId, categories: { $elemMatch: { "subService.subServiceId": subServiceId } } },
//       {
//         $set: {
//           "categories.$.active": active,
//           "categories.$.helpNow": helpNow,
//         },
//       },
//       { new: false, safe: true, upsert: true }
//     );

//     res.status(200).json({
//       statusCode: 200,
//       status: req.t("success_status"),
//       message: req.t("success_message_49"),
//     });
//   } catch (err) {
//     res.status(500).json(catchErr(err, req));
//   }
// };

module.exports = { setupCatagory, getCatagoryList, getCatagoryDetails };
