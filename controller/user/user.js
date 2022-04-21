const Users = require("../../models/user/Users");
const adminSecurityQuestions = require("../../models/security");
const { catchErr } = require("../../error");
const { sendOtp } = require("../../utils/otp");
const OtpData = require("../../models/perameters");

const editPhoneNumber = async (req, res) => {
  const { mobileNumber, userId, isAdditional } = req.body;
  const otpId = process.env.OTP_ID;
  try {
    const otpData = await OtpData.findById(otpId).select("+otpData");
    if (!mobileNumber || !userId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    const user = await Users.findById(userId);

    if (!user) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_9"),
      });
    }

    if (otpData.otpData.type === "production") {
      await sendOtp(req);
    }

    if (!isAdditional) {
      await Users.findByIdAndUpdate(userId, {
        $set: {
          "mobileNumber.value": mobileNumber,
          "mobileNumber.verified": false,
          "mobileNumber.OTP": 1234,
        },
      });

      const newUser = await Users.findById(userId, {
        mobileNumber: 1,
        userType: 1,
        userNature: 1,
        firstName: 1,
        lastName: 1,
        gender: 1,
        profilePic: 1,
        languagePreference: 1,
        status: 1,
      });

      res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        data: newUser,
      });
    }
    if (isAdditional) {
      await Users.findByIdAndUpdate(userId, {
        "optionalDetails.AdditionalMobileNumber.value": mobileNumber,
        "optionalDetails.AdditionalMobileNumber.verified": false,
        "optionalDetails.AdditionalMobileNumber.OTP": 1234,
      });

      const newUser = await Users.findById(userId, {
        "optionalDetails.AdditionalMobileNumber": 1,
        userType: 1,
        userNature: 1,
        firstName: 1,
        lastName: 1,
        gender: 1,
        profilePic: 1,
        languagePreference: 1,
        status: 1,
      });

      res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        data: newUser,
      });
    }
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const setSecurityQuestions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { securityQuestions } = req.body;

    if (securityQuestions.length < 3) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_10"),
      });
    }

    const adminQustion = await adminSecurityQuestions.find();

    let listOfExistingQue = [];
    let listOfNewQue = [];
    let notExistQue = [];

    // check questions valid or not
    adminQustion.map((que) => listOfExistingQue.push(que.question));

    securityQuestions.map((que) => listOfNewQue.push(que.question));

    let removeDuplicates = [...new Set(listOfNewQue)];

    securityQuestions.map(
      (que) =>
        !listOfExistingQue.includes(que.question) && notExistQue.push(que)
    );

    if (
      notExistQue.length !== 0 ||
      removeDuplicates.length !== listOfNewQue.length
    ) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_11"),
      });
    }

    await Users.findByIdAndUpdate(userId, {
      securityQuestions: securityQuestions,
    });

    const user = await Users.findById(userId, { securityQuestions: 1 });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_7"),
      data: user,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Users.findById(userId).select("-__v");

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: user,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const setUserProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      providerType,
      dob,
      PlaceName,
      PlaceId,
      HomeAddress,
      HouseName,
      HouseNo,
      Apartment,
      Timestamp,
      AddressType,
      lat,
      long,
      referralCode
    } = req.body;
    const { userId } = req.params;


    await Users.findOneAndUpdate({_id : userId}, {
        firstName,
        lastName,
        gender,
        providerType,
        dob,
        referralCode,
        "addressesHome.PlaceName": PlaceName,
        "addressesHome.PlaceId":PlaceId,
        "addressesHome.HouseName":HouseName,
        "addressesHome.HomeAddress":HomeAddress,
        "addressesHome.HouseNo": HouseNo,
        "addressesHome.Apartment": Apartment,
        "addressesHome.Timestamp": Timestamp,
        "addressesHome.AddressType": AddressType,
        "addressesHome.lat": lat,
        "addressesHome.long": long,
        profilePic: req.file?.filename,
    });

    const user = await Users.findById(userId);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: user,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const editAdditionalCustomerProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const additionalNumber = await Users.findById(userId, {
      "optionalDetails.AdditionalMobileNumber": 1,
    });

    const additionalProfileObject = {
      optionalDetails: {
        sexualOrientation: req.body.sexualOrientation || null,
        maritalStatus: req.body.maritalStatus || null,
        AdditionalEmail: {
          value: req.body.additionalEmail || null,
          verified: false,
        },
        AdditionalMobileNumber:
          additionalNumber?.optionalDetails?.AdditionalMobileNumber,
        education: {
          school: req.body.school || null,
          college: req.body.college || null,
          university: req.body.university || null,
          degree: req.body.degree || null,
        },
        age: req.body.age,
        languagesSpoken: req.body.languagesSpoken || null,
        birthPlace: req.body.birthPlace || null,
        hobbies: req.body.hobbies || null,
        occupation: req.body.occupation || null,
        interestingThings: req.body.interestingThings || null,
        socialMediaLinks: req.body.socialMediaLinks || [],
      },
    };

    await Users.findByIdAndUpdate(userId, additionalProfileObject);

    const user = await Users.findById(userId, { optionalDetails: 1 });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: user,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const uploadDocument = async (req, res) => {
  try {
    // const { filename } = req.file;
    // const { label } = req.body;
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    let Arrayof = [];
    let files = req.files;

    await files?.map((file) =>
      Arrayof.push({
        document: file.filename,
        label: file.filename.replace(/\.[^/.]+$/, ""),
      })
    );

    await Users.findByIdAndUpdate(userId, {
      documentApprovalStatus : "pending",
      document : Arrayof
    });

    const documents = await Users.findById(userId);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_10"),
      data: {
        documentApprovalStatus : documents?.documentApprovalStatus,
        Document : documents?.document
      },
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const deleteConsumerDocument = async (req, res) => {
  try {
    const { userId, documentId } = req.body;

    if (!userId || !documentId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    await Users.findByIdAndUpdate(userId, {
      $pull: { document: { _id: documentId } },
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_11"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getListOfDocument = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findById(userId);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: {
        documentApprovalStatus : user?.documentApprovalStatus,
        Document : user?.document
      },
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const saveTrustedContact = async (req, res) => {
  try {
    const { name, number, reminder } = req.body;
    const { userId } = req.params;

    await Users.findByIdAndUpdate(userId, {
      $push: {
        sosContacts: { name, number, reminder },
      },
    });

    const contact = await Users.findById(userId);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_12"),
      data: contact.sosContacts,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getListOfTrustedContacts = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findById(userId);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: user.sosContacts,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const deleteTrustedContact = async (req, res) => {
  try {
    const { userId, contactId } = req.body;

    if (!userId || !contactId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    await Users.findByIdAndUpdate(userId, {
      $pull: { sosContacts: { _id: contactId } },
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_13"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const updateTrustedContact = async (req, res) => {
  try {
    const { userId, contactId, name, number, reminder } = req.body;

    if (!userId || !contactId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    if (number.length !== 10) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_8"),
      });
    }

    await Users.findOneAndUpdate(
      { _id: userId, sosContacts: { $elemMatch: { _id: contactId } } },
      {
        $set: {
          "sosContacts.$.name": name,
          "sosContacts.$.number": number,
          "sosContacts.$.reminder": reminder,
        },
      }, // list fields you like to change
      { new: true, safe: true, upsert: true }
    );

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_14"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const addUserAddress = (req, res) => {
  try {
    const {
      PlaceName,
      PlaceId,
      HomeAddress,
      HouseName,
      HouseNo,
      Apartment,
      AddressType,
      Others,
    } = req.body;

    if (req.body.AddressType == "Home") {
      Users.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            addressesHome: {
              PlaceName,
              PlaceId,
              HomeAddress,
              HouseName,
              HouseNo,
              Apartment,
              AddressType,
              Others,
            },
          },
        },
        (error, data) => {
          if (error) {
            res.json({
              statusCode: 400,
              status: req.t("failure_status"),
              message: req.t("failure_message_12"),
              data: error,
            });
          } else {
            Users.findById(req.params.id, { addressesHome: 1 }, (err, data) => {
              res.json({
                statusCode: 200,
                status: req.t("success_status"),
                message: req.t("success_message_15"),
                data: [data],
              });
            });
          }
        }
      );
    } else if (AddressType == "Business") {
      Users.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            addressesBusiness: {
              PlaceName,
              PlaceId,
              HomeAddress,
              HouseName,
              HouseNo,
              Apartment,
              AddressType,
              Others,
            },
          },
        },
        (error, data) => {
          if (error) {
            res.json({
              statusCode: 400,
              status: req.t("failure_status"),
              message: req.t("failure_message_12"),
              error: error,
            });
          } else {
            Users.findById(
              req.params.id,
              { addressesBusiness: 1 },
              (err, data) => {
                res.json({
                  statusCode: 200,
                  status: req.t("success_status"),
                  message: req.t("success_message_16"),
                  data: [data],
                });
              }
            );
          }
        }
      );
    } else {
      Users.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            addressesOther: {
              PlaceName,
              PlaceId,
              HomeAddress,
              HouseName,
              HouseNo,
              Apartment,
              AddressType,
              Others,
            },
          },
        },
        (error, data) => {
          if (error) {
            res.json({
              statusCode: 400,
              status: req.t("failure_status"),
              message: req.t("failure_message_12"),
              error: error,
            });
          } else {
            Users.findById(
              req.params.id,
              { addressesOther: 1 },
              (err, data) => {
                res.json({
                  statusCode: 200,
                  status: req.t("success_status"),
                  message: req.t("success_message_17"),
                  data: [data],
                });
              }
            );
          }
        }
      );
    }
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getUserAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.AddressType == "Home") {
      const address = await Users.findById(id, {
        addressesHome: 1,
        addressesOther: 1,
      });

      return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        data: address,
      });
    } else if (req.body.AddressType == "Business") {
      const address = await Users.findById(id, {
        addressesBusiness: 1,
        addressesOther: 1,
      });

      return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        data: address,
      });
    }

    return res.status(400).json({
      statusCode: 400,
      status: req.t("failure_status"),
      message: req.t("success_message_18"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

module.exports = {
  editPhoneNumber,
  setSecurityQuestions,
  setUserProfile,
  getUserProfile,
  editAdditionalCustomerProfile,
  uploadDocument,
  deleteConsumerDocument,
  getListOfDocument,
  saveTrustedContact,
  getListOfTrustedContacts,
  deleteTrustedContact,
  updateTrustedContact,
  addUserAddress,
  getUserAddress,
};
