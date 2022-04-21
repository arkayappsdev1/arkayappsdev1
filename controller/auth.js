const { promisify } = require("util");
const axios = require("axios");
const { sendOtp } = require("../utils/otp");
// const nodemailer = require("nodemailer");
const validator = require("validator");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
const Users = require("../models/user/Users");
const { catchErr } = require("../error");
const OtpData = require("../models/perameters")

// const { WORKING_ROUTE } = require("../error");

const loginWithPhoneNumber = async (req, res) => {
  const otpId = process.env.OTP_ID;
  try {
    const otpData = await OtpData.findById(otpId).select("+otpData")
    if (otpData.otpData.type === "production") {
      await sendOtp(req);
    }

    let data = await Users.find({
      "mobileNumber.value": req.body.mobileNumber,
      "userNature" : req.body.userNature
    }).exec();
    if (data.length != 0) {
      await Users.findOneAndUpdate(
        { "mobileNumber.value": req.body.mobileNumber, "userNature" : req.body.userNature },
        {
          "mobileNumber.OTP": 1234,
          "mobileNumber.verified": false,
          fcmToken: req.body.fcmToken,
        }
      ).exec();
      const dd = await Users.findOne(
        { "mobileNumber.value": req.body.mobileNumber, "userNature" : req.body.userNature },
        { mobileNumber: 1, userType: 1, userNature: 1, status: 1 }
      ).exec();

      res.json({
        statusCode: 200,
        status: req.t("success_status"),
        data: dd,
      });
    } else {
      const data1 = {
        gender: req.body.gender,
        userNature: req.body.userNature,
        password: req.body.password,
        email: { value: req.body.email || null, verified: false },
        mobileNumber: {
          value: req.body.mobileNumber || null,
          OTP: 1234,
          verified: false,
        },
        fcmToken: req.body.fcmToken,
        languagePreference: req.body.languagePreference || "english",
        // gender: req.body.gender.toLowerCase(),
        userType: "Home",
        status: "active",
        documentApprovalStatus: "notSubmitted",
        profilePic: null,
        document: [],
        // verified: true,
        sosContacts: [],
        reviews: [],
        CreatedAt: new Date().toISOString(),
      };
      Users.create(data1, (error, data) => {
        if (error) {
          res.json({
            statusCode: 400,
            status: req.t("failure_status"),
            message: error.message,
          });
        } else {
          var resObject = {
            statusCode: 200,
            status: req.t("success_status"),
            message: req.t("success_message_19"),
            data: {
              mobileNumber: data1.mobileNumber,
              status: data1.status,
              userType: data1.userType,
              userNature: data1.userNature,
              _id: data._id,
            },
          };
          res.json(resObject);
        }
      });
    }
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const verifyPhoneNumberByOtp = async (req, res) => {
  const otpId = process.env.OTP_ID;
  const { userId, mobileNumber, otp, isAdditional } = req.body;
  try {
    const otpData = await OtpData.findById(otpId).select("+otpData")
    let condi = false;
    if (!mobileNumber || !otp || !userId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    if (otpData.otpData.type === "production") {
      const respnse = await axios.get(
        `https://api.msg91.com/api/v5/otp/verify?authkey=${otpData.otpData.auth_id}&mobile=${req.body.mobileNumber}&otp=${otp}`
      );
      if (respnse.data.type === "error") {
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: respnse.data.message,
        });
      }
      condi = true;
    }
    // check for main mobile number
    if (!isAdditional) {
      const existUser = await Users.findOne({
        _id: userId,
        "mobileNumber.value": mobileNumber,
      }).select("+pincode");

      if (!existUser) {
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: req.t("failure_message_13"),
        });
      }

      if (
        (otpData.otpData.type === "development" && parseInt(otp) === 1234) ||
        condi
      ) {
        await Users.findOneAndUpdate(
          { _id: userId, "mobileNumber.value": mobileNumber },
          { "mobileNumber.verified": true, loginStatus : "loggedIn" }
        );
        if (!existUser.pincode) {
          const newUser = await Users.findOne({
            _id: userId,
            "mobileNumber.value": mobileNumber,
          });

          console.log("newUSer",newUser);

          const token = jwt.sign(
            { id: existUser._id },
            process.env.JWT_SECRET,
            {
              expiresIn: process.env.JWT_EXPIRES_IN,
            }
          );

          return res.status(200).json({
            statusCode: 200,
            status: req.t("success_status"),
            data: {
              _id: newUser._id,
              userType: newUser.userType,
              userNature: newUser.userNature,
              firstName: newUser.firstName,
              lastName: newUser.lastName,
              gender: newUser.gender,
              languagePreference: newUser.languagePreference,
              status: newUser.status,
              profilePic: newUser.profilePic,
              optionalDetails: newUser.optionalDetails,
              mobileNumber: newUser.mobileNumber,
              loginStatus: newUser.loginStatus,
              dob:newUser.dob,
              addressesHome: newUser.addressesHome,
              providerType: newUser.providerType,
              memberSince: newUser.memberSince,
              fcmToken: token,
            
            },
          });
        }

        return res.status(200).json({
          statusCode: 200,
          status: req.t("success_status"),
          message: req.t("success_message_21"),
        });
      }
    }

    // check for additional mobile number
    if (isAdditional) {
      const existUser = await Users.findOne({
        _id: userId,
        "optionalDetails.AdditionalMobileNumber.value": mobileNumber,
      });

      if (!existUser) {
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: req.t("failure_message_2"),
        });
      }

      if (
        (otpData.otpData.type === "development" && parseInt(otp) === 1234) ||
        condi
      ) {
        await Users.findOneAndUpdate(
          {
            _id: userId,
            "optionalDetails.AdditionalMobileNumber.value": mobileNumber,
          },
          { "optionalDetails.AdditionalMobileNumber.verified": true }
        );

        const newUser = await Users.findOne({
          _id: userId,
          "optionalDetails.AdditionalMobileNumber.value": mobileNumber,
        });

        return res.status(200).json({
          statusCode: 200,
          status: req.t("success_status"),
          data: {
            _id: newUser._id,
            userType: newUser.userType,
            userNature: newUser.userNature,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            gender: newUser.gender,
            languagePreference: newUser.languagePreference,
            status: newUser.status,
            profilePic: newUser.profilePic,
            optionalDetails: newUser.optionalDetails,
          },
        });
      }
    }
    res.status(400).json({
      statusCode: 400,
      status: req.t("failure_status"),
      message: req.t("failure_message_15"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const logout = async (req, res) => {
  try {
    const {userId} = req.query;

    if(!userId){
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6")
      })
    }
    await Users.findByIdAndUpdate(userId, {loginStatus : "loggedOut"})

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_50")
    })
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
}

const setPinCode = async (req, res) => {
  const { pin, confirmPin } = req.body;
  const { userId } = req.params;
  try {
    const checkMobileNumber = await Users.findById(userId, {
      "mobileNumber.verified": 1,
    });

    if (checkMobileNumber.mobileNumber.verified === false) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_16"),
      });
    }

    if (pin !== confirmPin) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_17"),
      });
    }

    if (pin.length <= 7) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_18"),
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

    // const encryptedPin = await bcrypt.hash(pin, 12);

    await Users.findByIdAndUpdate(userId, {
      pincode: pin,
      pinChangedAt: Date.now() - 1000,
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_22"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const verifyPin = async (req, res) => {
  try {
    const { mobileNumber, pin, userNature } = req.body;

    if (!mobileNumber || !pin) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_19"),
      });
    }

    const existUser = await Users.findOne({
      "mobileNumber.value": req.body.mobileNumber,
      "userNature" : userNature
    })
      .select("+pincode")
      .exec();

    if (!existUser || !(parseInt(pin) === parseInt(existUser.pincode))) {
      return res.status(401).json({
        statusCode: 401,
        status: req.t("failure_status"),
        message: req.t("failure_message_19"),
      });
    }

    // add auth
    const token = jwt.sign({ id: existUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // change Login status
    await Users.findOneAndUpdate({
      "mobileNumber.value": req.body.mobileNumber,
      "userNature" : userNature
    }, {loginStatus : "loggedIn"})

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      token,
      data: {
        _id: existUser._id,
        userType: existUser.userType,
        userNature: existUser.userNature,
        languagePreference: existUser.languagePreference,
        status: existUser.status,
        profilePic: existUser.profilePic,
      },
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const resendPhoneVarificationOtp = async (req, res) => {
  const otpId = process.env.OTP_ID;
  const { mobileNumber, userId, isAdditional } = req.body;
  const otpData = await OtpData.findById(otpId).select("+otpData")
  try {
    if (!mobileNumber || !userId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    if (otpData.otpData.type === "production") {
      const response = await axios.get(
        `https://api.msg91.com/api/v5/otp/retry?authkey=${otpData.otpData.auth_id}&retrytype=${otpData.otpData.resend_otp_type}&mobile=${req.body.mobileNumber}`
      );
      if (response.data.type === "error") {
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: response.data.message,
        });
      }
    }
    if (isAdditional) {
      const existUser = await Users.findOne({
        _id: userId,
        "optionalDetails.AdditionalMobileNumber.value": parseInt(
          req.body.mobileNumber
        ),
      }).exec();

      if (!existUser) {
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: req.t("failure_message_2"),
        });
      } else if (existUser.optionalDetails.AdditionalMobileNumber.verified) {
        return res.status(200).json({
          statusCode: 200,
          status: req.t("success_status"),
          message: req.t("success_message_20"),
        });
      }

      await Users.updateOne(
        { "optionalDetails.AdditionalMobileNumber.value": mobileNumber },
        { "optionalDetails.AdditionalMobileNumber.OTP": 1234 }
      );

      res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        message: req.t("success_message_23"),
        data: {
          AdditionalMobileNumber: {
            value: mobileNumber,
            otp: 1234,
            verified: false,
          },
        },
      });
    } else if (!isAdditional) {
      const existUser = await Users.findOne({
        _id: userId,
        "mobileNumber.value": req.body.mobileNumber,
      }).exec();

      if (!existUser) {
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: req.t("failure_message_2"),
        });
      } else if (existUser.mobileNumber.verified) {
        return res.status(200).json({
          statusCode: 200,
          status: req.t("success_status"),
          message: req.t("success_message_20"),
        });
      }
      // let otp = Math.floor(1000 + Math.random() * 9000);

      await Users.updateOne(
        { "mobileNumber.value": mobileNumber },
        { "mobileNumber.OTP": 1234 }
      );

      res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        message: req.t("success_message_23"),
        data: {
          mobileNumber: {
            value: mobileNumber,
            otp: 1234,
            verified: false,
          },
        },
      });
    }
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const sendPinForPinRecovery = async (req, res) => {
  const { email, mobileNumber, via } = req.body;
  try {
    // const otp = Math.floor(1000 + Math.random() * 9000);

    if (!via) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_20"),
      });
    }

    if (via === "email") {
      const user = await Users.findOne(
        { "email.value": email },
        { "email.verified": 1, pincode: 1 }
      );
      if (!user) {
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: req.t("failure_message_9"),
        });
      }

      if (!user.email.verified) {
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: req.t("failure_message_34"),
        });
      }

      // let transport = nodemailer.createTransport({
      //   host: "smtp.mailtrap.io",
      //   port: 2525,
      //   auth: {
      //     user: "628f09046be4fe",
      //     pass: "df7bc86a72c61d",
      //   },
      // });
      // let details = {
      //   from: "jaypatel9800@gmail.com", // sender address same as above
      //   to: email, // Receiver's email id
      //   subject: "Your demo pin is", // Subject of the mail.
      //   html: user.pincode, // Sending OTP
      // };

      // await transport.sendMail(details);
      res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        message: req.t("success_message_29"),
      });
    }
    if (via === "mobileNumber") {
      const user = await Users.findOne(
        { "mobileNumber.value": mobileNumber },
        { "mobileNumber.verified": 1, pincode: 1 }
      );
      if (!user) {
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: req.t("failure_message_9"),
        });
      }

      if (!user.mobileNumber.verified) {
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: req.t("failure_message_16"),
        });
      }

      //  Send message implementation is pending

      res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        message: req.t("success_message_30"),
      });
    }
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

// const verifyOtpForPinRecovery = async (req, res) => {
//   try {
//     const { via, email, mobileNumber, otp } = req.body;

//     if (
//       (!via === "email" && !email) ||
//       (!via === "mobileNumber" && !mobileNumber) ||
//       !otp
//     ) {
//       return res.status(400).json({
//         statusCode: 400,
//         status: req.t("failure_status"),
//         message: "Please provide a valid data",
//       });
//     }

//     if (via === "email") {
//       const user = await Users.findOne(
//         { "email.value": email },
//         { forgotPin: 1 }
//       );
//       if (!user) {
//         return res.status(400).json({
//           statusCode: 400,
//           status: req.t("failure_status"),
//           message: req.t("failure_message_9"),
//         });
//       }

//       const otpTime = await user.forgotPin.timeStmap.valueOf();
//       let timeInstance = Date.now();

//       let counter = timeInstance - otpTime < 1000 * 60 * 5;

//       if (!counter) {
//         return res.status(400).json({
//           statusCode: 400,
//           status: req.t("failure_status"),
//           message: req.t("failure_message_21"),
//         });
//       }

//       if (parseInt(otp) !== user.forgotPin.emailOtp.otp) {
//         return res.status(400).json({
//           statusCode: 400,
//           status: req.t("failure_status"),
//           message: req.t("failure_message_22"),
//         });
//       }

//       await Users.findOneAndUpdate(
//         { "email.value": email },
//         {
//           $set: {
//             "forgotPin.emailOtp.verified": true,
//           },
//         }
//       );

//       res.status(200).json({
//         statusCode: 200,
//         status: req.t("success_status"),
//         message: req.t("failure_message_23"),
//       });
//     }

//     if (via === "mobileNumber") {
//       const user = await Users.findOne(
//         { "mobileNumber.value": mobileNumber },
//         { forgotPin: 1 }
//       );
//       if (!user) {
//         return res.status(400).json({
//           statusCode: 400,
//           status: req.t("failure_status"),
//           message: req.t("failure_message_9"),
//         });
//       }

//       const otpTime = await user.forgotPin.timeStmap.valueOf();
//       let timeInstance = Date.now();

//       let counter = timeInstance - otpTime < 1000 * 60 * 5;

//       if (!counter) {
//         return res.status(400).json({
//           statusCode: 400,
//           status: req.t("failure_status"),
//           message: req.t("failure_message_21"),
//         });
//       }

//       if (parseInt(otp) !== user.forgotPin.mobileOtp.otp) {
//         return res.status(400).json({
//           statusCode: 400,
//           status: req.t("failure_status"),
//           message: req.t("failure_message_22"),
//         });
//       }

//       await Users.findOneAndUpdate(
//         { "mobileNumber.value": mobileNumber },
//         {
//           $set: {
//             "forgotPin.mobileOtp.verified": true,
//           },
//         }
//       );

//       res.status(200).json({
//         statusCode: 200,
//         status: req.t("success_status"),
//         message: req.t("failure_message_23"),
//       });
//     }
//   } catch (err) {
//     res.status(500).json(catchErr(err, req));
//   }
// };

const verifySecurityQuestions = async (req, res) => {
  try {
    const { mobileNumber, securityQuestions } = req.body;

    if (!mobileNumber || !securityQuestions || mobileNumber.length !== 10) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_24"),
      });
    }

    if (securityQuestions.length < 3) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_10"),
      });
    }

    const savedQuestion = await Users.findOne(
      {
        "mobileNumber.value": mobileNumber,
      },
      { securityQuestions: 1 }
    );

    let listOfExistingQue = []; //saved questions by user
    let listOfNewQue = []; //client list of questions
    let notExistQue = []; //duplicate questions

    savedQuestion.securityQuestions.map((que) =>
      listOfExistingQue.push(que.question)
    );

    await securityQuestions.map((que) => listOfNewQue.push(que.question));

    let removeDuplicateQuestions = [...new Set(listOfNewQue)]; //check for duplicate questions

    let faulty = await securityQuestions.filter(
      (que) => que.question && que.answer
    );

    await securityQuestions.map(
      (que) =>
        !listOfExistingQue.includes(que.question) && notExistQue.push(que)
    );

    if (
      notExistQue.length !== 0 ||
      removeDuplicateQuestions.length !== listOfNewQue.length ||
      faulty.length !== listOfNewQue.length
    ) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_11"),
      });
    }

    // verify questions and answers

    let verifyQuestions = [];

    await securityQuestions.filter(
      (que) =>
        !savedQuestion.securityQuestions.find(
          (newQue) =>
            que.question === newQue.question &&
            que.answer === newQue.answer &&
            verifyQuestions.push(newQue)
        )
    );

    if (verifyQuestions.length !== securityQuestions.length) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_11"),
      });
    }

    await Users.findOneAndUpdate(
      {
        "mobileNumber.value": mobileNumber,
      },
      {
        $set: {
          "forgotPinViaSecurityQuestion.verified": true,
        },
      }
    );

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_25"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const updatePin = async (req, res) => {
  try {
    const { newPin, confirmPin, userId, oldPin } = req.body;

    const user = await Users.findById(userId, { pincode: 1 });

    if (!user) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_9"),
      });
    }

    if (user.pincode !== oldPin) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_36"),
      });
    }

    if (newPin === oldPin) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_35"),
      });
    }
    if (newPin !== confirmPin) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_17"),
      });
    }
    if (newPin.length <= 7) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_18"),
      });
    }

    await Users.findOneAndUpdate(
      { _id: userId },
      {
        pincode: newPin,
        pinChangedAt: Date.now() - 1000,
      }
    );

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_31"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const emailVerificationRequest = async (req, res) => {
  const { email, userId } = req.body;
  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: "Invalid email address",
      });
    }

    const user = await Users.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    // let otp = Math.floor(1000 + Math.random() * 9000);

    await Users.findByIdAndUpdate(userId, {
      "email.value": email,
      "email.verified": false,
      "email.OTP": 1234,
    });

    const newUser = await Users.findById(userId, { email: 1 });

    return res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: newUser,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

// multi language support is pending for this route
const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    if (!userId || !otp) {
      return res.status(400).json({
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    const findEmail = await Users.findOne({ _id: userId });
    if (!findEmail) {
      return res.status(404).json({
        statusCode: 404,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    } else if (parseInt(findEmail.email.OTP) !== parseInt(otp)) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_15"),
      });
    } else if (parseInt(findEmail.email.OTP) === parseInt(otp)) {
      await Users.findByIdAndUpdate(
        findEmail._id,
        { "email.verified": true },
        {
          new: true,
          runValidators: true,
        }
      );
      const email = await Users.findById(findEmail._id, {
        email: 1,
        userType: 1,
        userNature: 1,
        languagePreference: 1,
        status: 1,
        profilePic: 1,
        firstName: 1,
        lastName: 1,
        gender: 1,
      });
      res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        data: email,
      });
    }
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

// multi language support is pending for this route
const resendVerifyEmail = async (req, res) => {
  // const { email } = req.body;

  try {
    // if (!validator.isEmail(email)) {
    //   return res.status(400).json({
    //     status: req.t("failure_status"),
    //     message: "Invalid email address",
    //   });
    // }

    // const findEmail = await EmailUsers.findOne({ email }).select(
    //   "otp verified"
    // );
    // if (!findEmail) {
    //   return res.status(404).json({
    //     status: req.t("failure_status"),
    //     message: "Email not found",
    //   });
    // }
    // let otp = Math.floor(1000 + Math.random() * 9000);

    // let transport = nodemailer.createTransport({
    //   host: "smtp.mailtrap.io",
    //   port: 2525,
    //   auth: {
    //     user: "628f09046be4fe",
    //     pass: "df7bc86a72c61d",
    //   },
    // });
    // let details = {
    //   from: "jaypatel9800@gmail.com", // sender address same as above
    //   to: email, // Receiver's email id
    //   subject: "Your demo OTP is ", // Subject of the mail.
    //   html: otp.toString(), // Sending OTP
    // };
    // await EmailUsers.findOneAndUpdate({ email }, { otp });
    // await transport.sendMail(details);
    res.status(200).json({
      status: req.t("success_status"),
      message: "Route is not ready yet",
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== "bigpadmin@gmail.com" || password !== "bigp123") {
      return res.status(200).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    const token = jwt.sign({ id: Date.now() }, process.env.JWT_ADMIN_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      token,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const protected = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = await req.headers.authorization.split(" ")[1];
  }

  // check for token
  if (!token) {
    return res.status(401).json({
      statusCode: 401,
      status: req.t("failure_status"),
      message: req.t("failure_message_27"),
    });
  }

  // verify token
  if (token) {
    try {
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      const currentUser = await Users.findById(decoded.id);

      if (!currentUser) {
        return res.status(401).json({
          statusCode: 401,
          status: req.t("failure_status"),
          message: req.t("failure_message_9"),
        });
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({
          statusCode: 401,
          status: req.t("failure_status"),
          message: req.t("failure_message_28"),
        });
      }
    } catch (err) {
      return res.status(500).json(catchErr(err, req));
    }
  }

  next();
};

const adminProtect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = await req.headers.authorization.split(" ")[1];
  }

  // check for token
  if (!token) {
    return res.status(401).json({
      statusCode: 401,
      status: req.t("failure_status"),
      message: req.t("failure_message_27"),
    });
  }

  // verify token
  if (token) {
    try {
      await promisify(jwt.verify)(token, process.env.JWT_ADMIN_SECRET);
    } catch (err) {
      return res.status(500).json(catchErr(err, req));
    }
  }

  next();
};

module.exports = {
  loginWithPhoneNumber,
  verifyPhoneNumberByOtp,
  setPinCode,
  verifyPin,
  resendPhoneVarificationOtp,
  sendPinForPinRecovery,
  // verifyOtpForPinRecovery,
  verifySecurityQuestions,
  updatePin,
  emailVerificationRequest,
  verifyEmail,
  resendVerifyEmail,
  logout,
  adminLogin,
  protected,
  adminProtect,

};
