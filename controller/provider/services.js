const BookingCatagory = require("../../models/user/bookingCatagory");
const Users = require("../../models/user/Users");
const country = require("../../models/country");
const Service = require("../../models/user/service");
const { catchErr } = require("../../error");
const coordsDistance = require("../../utils/gps");
const { hhmmToHours } = require('../../utils/stringutils');


const getBookingList = async (req, res) => {
  try {
    const { providerId, bookingStatus, lat, long, subserviceId } = req.body;
    if (!providerId || !bookingStatus) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }
    
    
    const user = await Users.findById(providerId).exec(); //provider category list
    
    const catagories = await user?.categories?.filter(
      (x) => x.approvalStatus === "approved" && x.active === true && x.saveForLater === false
    ); //check approval and active Status

    var d = new Date();
    d.setHours(d.getHours() - 3);

    const bookings = await BookingCatagory.find({
      "ServiceDetails.bookingstatus": { $in: bookingStatus },
      "ServiceDetails.subserviceId": {
        $in: catagories.map((x) => x.subService?.subServiceId), //match with sub service id
      },
      "ServiceDetails.Servicetime.from": {
        $gte: d,
      },
    }).populate({
        path: "UserID",
        select: [
          "firstName",
          "lastName",
          "profilePic",
          "userType",
          "languagePreference",
          "optionalDetails",
          "rating",
          "noOfReviews",
          "favoriteCount",
          "noOfServices",
          "memberSince",
        ],
      })
      .select(
        "-acceptedProviderDetails.Providerdetails  -acceptedProviderDetails.Costdetails.additionalLabourMaterial -ProviderDetails.ProviderDetails  -ProviderDetails.costDetails.additionalLabourMaterial  -ServiceDetails.OTP -ServiceDetails.OTPVerify -ServiceDetails.requestResheduling -ServiceDetails.requestMoreTime -ServiceDetails.requestMoreLaborMaterial"
      ).sort({
        "ServiceDetails.Servicetime.from": -1,
      });
 
     const filterBooking = [];

    // For filter gender
    await bookings.map((booking) => {

      let Gender = booking.ServiceDetails?.Gender;
      let subServiceId = booking.ServiceDetails?.subserviceId;
       
      let category = catagories.filter(
        (a) => a.subService?.subServiceId === subServiceId
      );
        

      let newData = [];

      category.map((a) => {
        a.genderPreference.filter((a) => Gender.includes(a))&& newData.push(a);
      });

      newData.length !== 0 && filterBooking.push(booking);

    });

       
    let newFilterBooking = [];   

    // filter via servicePreference (home, business, all)
    filterBooking.map((booking) => {
      let servicePref = booking?.ServiceDetails?.servicePreference;
    
      let subServiceId = booking?.ServiceDetails?.subserviceId;
   
      let category = catagories.filter(
        (a) => a.subService?.subServiceId === subServiceId
      );
  
      category.map((a) =>
          (a.servicePreference === "all" ||
            a.servicePreference?.toUpperCase() === servicePref?.toUpperCase()) && newFilterBooking.push(booking) //add to upper case
      );
    
    });
  

    // filter via servicePreference (home, business, all)
    

   
    const finalFilterBooking = [];
    const filter_ids = [];
    // filter based on range
    newFilterBooking?.map((booking) => {
   
      let coords = booking.ServiceDetails?.coordinates;
      let distance = coordsDistance(lat, long, coords.lat, coords.long);

      let subServiceId = booking.ServiceDetails?.subserviceId;
      let category = catagories.filter(
        (a) => a.subService?.subServiceId === subServiceId
      );

      category.map((a) =>{
        if(a.serviceRadius.split(' ')[0] <= distance  || a.serviceRadius.split(' ')[0] >= distance){
          
          let hourlyRate =  a?.hourlyRate;
          let taskDuration =  a?.taskDuration;
          let laborCost =
          (parseInt(a?.taskDuration?.split(":")[0]) +
          parseInt(a?.taskDuration?.split(":")[1]) / 60) *
          parseInt(a?.hourlyRate);
          let peakSurchargePercent = parseInt(a?.peakHourSurcharge);
          let peakHourSurchargeAmount = laborCost * peakSurchargePercent * 0.01; //plus
          let secondHourDiscount = parseInt(a?.nextHourDiscount);
          let secondHourDiscountAmmount = laborCost * secondHourDiscount * 0.01; //minus
          let totalAmmount =
            laborCost + peakHourSurchargeAmount - secondHourDiscountAmmount;
      
          const costDetails = {
            hourlyRate,
            taskDuration,
            laborCost,
            peakSurchargePercent,
            peakHourSurchargeAmount,
            secondHourDiscount,
            secondHourDiscountAmmount,
            totalAmmount,
          };

          const bookingList ={
            _id: booking._id,
            userDetails: booking.UserID,
            distance:distance,
            ServiceDetails:booking.ServiceDetails,
            costDetails: costDetails,
            estimatedPrice:  (parseInt( booking.ServiceDetails?.Estimatedtaskduration[0]?.split(":")[0]) +
            parseInt( booking.ServiceDetails?.Estimatedtaskduration[0]?.split(":")[1]) / 60) * parseInt(booking.ServiceDetails?.AveragePrice)
           
          }
          if(booking.ServiceDetails.bookingstatus == 'pending'){
            bookingList['remainingTime'] = new Date(
                new Date( booking.ServiceDetails?.ProviderResponseBy?.to).getTime() -
                  Date.now()
              ).getTime();            
          }
          finalFilterBooking.push(bookingList)
          filter_ids.push(booking._id)
        } 
      }  
      );
    });
    
    bookings.map((booking) => {
    
      let subServiceId = booking.ServiceDetails?.subserviceId;
       
      let category = catagories.filter(
        (a) => a.subService?.subServiceId === subServiceId
      );
      
      var fp = booking.ServiceDetails.favouriteProviders
      if(booking.ServiceDetails.favouriteProviders.length > 0){
         fp = JSON.parse(booking.ServiceDetails.favouriteProviders)
      }
      
      var lp = booking.ServiceDetails.localproviders
     
      if(!filter_ids.includes(booking._id)){
        if(fp.includes(providerId) || lp.includes(providerId) ){
          finalFilterBooking.push(booking)
        }
      }
      
    });

    // if (bookingStatus === "pending") {
      return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        data: finalFilterBooking,
      });
    // }

    // const newArrayOfObj = finalFilterBooking.map(
    //   ({_id, userDetails,ServiceDetails,costDetails,distance}) => ({
    //     _id,
    //     userDetails,
    //     distance,
    //     ServiceDetails,
    //     costDetails,
    //     remainingTime: new Date(
    //       new Date( ServiceDetails?.ProviderResponseBy?.to).getTime() -
    //         Date.now()
    //     ).getTime(),
    //     estimatedPrice:
    //       (parseInt( ServiceDetails?.Estimatedtaskduration[0]?.split(":")[0]) +
    //         parseInt( ServiceDetails?.Estimatedtaskduration[0]?.split(":")[1]) /
    //           60) *
    //       parseInt(ServiceDetails?.AveragePrice),
    //   })
    // );


    // if (bookingStatus === "all") {
    //   return res.status(200).json({
    //     statusCode: 200,
    //     status: req.t("success_status"),
    //     data: newArrayOfObj,
    //   });
    // }


    // let newBookings = [];

    // bookings.filter(
    //   (booking) => {
    //     booking.ServiceDetails?.bookingstatus === bookingStatus && newBookings.push(booking)
        
    //   }
    // );

    
    // res.status(200).json({
    //   statusCode: 200,
    //   status: req.t("success_status"),
    //   data: newArrayOfObj,
    // });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

///finished here

const taskDetails = async (req, res) => {
  try {
    const { bookingId, providerId } = req.body;

    if (!bookingId || !providerId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const bookingDetails = await BookingCatagory.find(
      {
        _id: bookingId,
      },
      {
        ServiceDetails: 1,
      }
    ).populate({
      path: "UserID",
      select: [
        "firstName",
        "lastName",
        "profilePic",
        "userType",
        "languagePreference",
        "languagePreference",
        "optionalDetails",
      ],
    });

    const newArrayOfObj = await bookingDetails.map(
      ({ _id, UserID: userDetails, ServiceDetails }) => ({
        _id,
        userDetails,
        ServiceDetails,
      })
    );

    const subServiceId = await newArrayOfObj[0].ServiceDetails.subserviceId;

    const catagory = await Users.findById(providerId, {
      categories: { $elemMatch: { "subService.subServiceId": subServiceId } },
    });

    const newCatagory = await catagory.categories[0];

    let hourlyRate = await newCatagory?.hourlyRate;
    let taskDuration = await newCatagory?.taskDuration;
    let laborCost =
      (parseInt(newCatagory?.taskDuration?.split(":")[0]) +
        parseInt(newCatagory?.taskDuration?.split(":")[1]) / 60) *
      parseInt(newCatagory?.hourlyRate);
    let peakSurchargePercent = parseInt(newCatagory?.peakHourSurcharge);
    let peakHourSurchargeAmount = laborCost * peakSurchargePercent * 0.01; //plus
    let secondHourDiscount = parseInt(newCatagory?.nextHourDiscount);
    let secondHourDiscountAmmount = laborCost * secondHourDiscount * 0.01; //minus
    let totalAmmount =
      laborCost + peakHourSurchargeAmount - secondHourDiscountAmmount;

    const newObj = {
      hourlyRate,
      taskDuration,
      laborCost,
      peakSurchargePercent,
      peakHourSurchargeAmount,
      secondHourDiscount,
      secondHourDiscountAmmount,
      totalAmmount,
    };

    const finalObj = { ...newArrayOfObj[0], costDetails: newObj };

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: finalObj,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const acceptServiceReq = async (req, res) => {
  try {
    const {
      bookingId,
      providerId,
      additionalDiscount,
      additionalDiscountAmount,
      additionalLabourMaterial,
      newStarttTime,
      proposedTime,
      additionalTime,
      hourlyRate,
      estimatedHours,
      laborCost,
      peakSurchargePercent,
      peakSurchargeAmount,
      nextHourDiscount,
      nextHourDiscountAmount,
      laborSubtotal,
      rescaduleDiscount,

    } = req.body;

    const Response = await BookingCatagory.findOne({
      _id: bookingId,
    }).exec();

    const user = await Users.findOne({ _id: providerId });

    if (!Response || !user) {
      return res.json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_3"),
      });
    }

    const costDetails = {
      additionalDiscount,
      additionalDiscountAmount,
      additionalLabourMaterial,
      newStarttTime,
      proposedTime,
      hourlyRate,
      estimatedHours: hhmmToHours(estimatedHours),
      laborCost,
      peakSurchargePercent,
      peakSurchargeAmount,
      nextHourDiscount,
      nextHourDiscountAmount,
      laborSubtotal,
      rescaduleDiscount,
    };

    const providerDetails = {
      ProviderId: providerId,
      firstName: user.firstName,
      gender: JSON.stringify(user.gender),
      isProcess: true,
      status: user.status,
      age: user.age,
      rating: user.rating,
      noOfReviews: user.noOfReviews,
      favoriteCount: user.favoriteCount,
      cancellationPercent: 20,
      noOfJobs: user.noOfServices,
      memberSince: user.memberSince,
      ProviderStatus: user.status,
      serviceHistory: "yes",
      isProvider: "Responded",
      optionalDetails: user.optionalDetails,
    };

    const ProviderDetails = {
      ProviderDetails: providerDetails,
      costDetails: costDetails,
    };


    await BookingCatagory.findOneAndUpdate(
      {
        _id: bookingId,
      },
      {
        ProviderDetails: ProviderDetails,
        "ServiceDetails.bookingstatus": "Responded",
      }
    ).exec();

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_1"),
      data:costDetails
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};


const DeclineServiceReq = async (req, res) => {
  try {
    const {
      bookingId,
      providerId,
    } = req.body;

    const Response = await BookingCatagory.findOne({
      _id: bookingId,
    }).exec();

    const user = await Users.findOne({ _id: providerId });

    if (!Response || !user) {
      return res.json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_3"),
      });
    }

    await BookingCatagory.findOneAndUpdate(
      {
        _id: bookingId,
      },
      {
        "ServiceDetails.bookingstatus": "Decline",
      }
    ).exec();

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_1"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const reqAdditionalLaborMaterial = async (req, res) => {
  try {
    const { additionalLabourMaterial, bookingId } = req.body;

    const Response = await BookingCatagory.findOne({
      _id: bookingId,
    }).exec();

    if (!Response) {
      return res.json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_3"),
      });
    }

    await BookingCatagory.findOneAndUpdate(
      {
        _id: bookingId,
      },
      {
        $set: {
          "ServiceDetails.requestMoreLaborMaterial": additionalLabourMaterial,
        },
      }
    ).exec();

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_1"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const reqMoreTime = async (req, res) => {
  try {
    const {
      bookingId,
      additionalTime,
      reason,
      isFree,
      additionalCost,
      description,
    } = req.body;
    if (!bookingId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    await BookingCatagory.findOneAndUpdate(
      { _id: bookingId },
      {
        $set: {
          "ServiceDetails.requestMoreTime.additionalTime": additionalTime,
          "ServiceDetails.requestMoreTime.isFree": isFree,
          "ServiceDetails.requestMoreTime.additionalCost": additionalCost,
          "ServiceDetails.requestMoreTime.reason": reason,
          "ServiceDetails.requestMoreTime.status": "pending",
          "ServiceDetails.requestMoreTime.description": description,
        },
      }
    ).exec();

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_1"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const reqRescadule = async (req, res) => {
  try {
    const { bookingId, time, reasonTitle, reasonDesc, rescheduleDiscount } =
      req.body;

    if (!bookingId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const booking = await BookingCatagory.findById(bookingId).select(
      "+ServiceDetails"
    );

    if (!booking) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    await BookingCatagory.findByIdAndUpdate(bookingId, {
      "ServiceDetails.requestResheduling.time": time,
      "ServiceDetails.requestResheduling.reasonTitle": reasonTitle,
      "ServiceDetails.requestResheduling.reasonDesc": reasonDesc,
      "ServiceDetails.requestResheduling.rescheduleDiscount":
        rescheduleDiscount,
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_1"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const verifyBookingOtp = async (req, res) => {
  try {
    const { otp, bookingId } = req.body;

    if (!otp || !bookingId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    const booking = await BookingCatagory.findOne({
      _id: bookingId,
      "ServiceDetails.OTP": otp,
    });

    if (!booking) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_15"),
      });
    }

    await BookingCatagory.findByIdAndUpdate(bookingId, {
      "ServiceDetails.OTPVerify": true,
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("failure_message_23"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const cancelService = async (req, res) => {
  try {
    const { reason, description, bookingId } = req.body;

    if (!bookingId || !reason || !description) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    const booking = await BookingCatagory.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        statusCode: 404,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    await BookingCatagory.findByIdAndUpdate(bookingId, {
      $set: {
        "ServiceDetails.cancelTask.reason": reason,
        "ServiceDetails.cancelTask.description": description,
        "ServiceDetails.bookingstatus": "cancelled",
      },
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_45"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getEarnings = async (req, res) => {
  try {
    const { providerId } = req.query;

    if (!providerId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const earnings = await BookingCatagory.find(
      { "ServiceDetails.bookedon": providerId },
      { "ServiceDetails.Payment": 1 }
    );

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: earnings,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getDocuments = async (req, res) => {
  try {
    const { For, countryCode, serviceId } = req.query;

    // if(For === "country" || For === "service"){
    //   const docs = await Document.find({documentFor : For}).select("-expireDate")

    //   return res.status(200).json({
    //     statusCode: 200,
    //     status: req.t("success_status"),
    //     data: docs
    //   })
    // }
  
    
    if (For === "country") {
      const getDocs = await country.findOne(
        { countryCode },
        { requireDocument: 1, documentList: 1 }
      );
      if(!getDocs){
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: "No Data",
      
      })}

       return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        data: getDocs,
      });
    }

    if (For === "service"){
      const getDocs = await Service.findOne(
        { _id : serviceId },
        { docRequirement: 1, documentList: 1 }
      );
      if(!getDocs){
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: "No Data",
      
      })}
      

      return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        data: getDocs,
      });
    }

    res.status(400).json({
      statusCode: 400,
      status: req.t("failure_status"),
      message: req.t("failure_message_2"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const updateServiceStatus = async (req, res) => {
  try {
    const { status, bookingId } = req.body;
    
    if (!bookingId || !status) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    const booking = await BookingCatagory.findById(bookingId);

    bookingStatus = status.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    
    if (!booking) {
      return res.status(404).json({
        statusCode: 404,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    await BookingCatagory.findByIdAndUpdate(bookingId, {
      $set: {
        "ServiceDetails.bookingstatus": bookingStatus,
      },
    }).exec();

    // Count the number of completed services of provider
    providerId = booking.acceptedProviderDetails.Providerdetails.ProviderId 
    const count = await BookingCatagory.count({
      "ServiceDetails.bookingstatus": "completed",
      "acceptedProviderDetails.Providerdetails.ProviderId": providerId
    });

    await Users.findByIdAndUpdate(providerId, {
      noOfServices: count,
    }).exec();
    
    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_51"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

module.exports = {
  getBookingList,
  acceptServiceReq,
  DeclineServiceReq,
  reqAdditionalLaborMaterial,
  reqMoreTime,
  reqRescadule,
  taskDetails,
  cancelService,
  verifyBookingOtp,
  getEarnings,
  getDocuments,
  updateServiceStatus
};
