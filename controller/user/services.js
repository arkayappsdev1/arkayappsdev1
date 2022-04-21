const BookingCatagory = require("../../models/user/bookingCatagory");
const Users = require("../../models/user/Users");
const Services = require("../../models/user/service");
// const SubServiceSchema = require("../../models/user/subService");
const Experience = require("../../models/experienceQuestion");
const Issue = require("../../models/issues");
const UserIssues = require("../../models/user/userIssue");
const coordsDistance = require("../../utils/gps");
const { catchErr } = require("../../error");

const util   = require("../../utils/stringutils");


 const requestService = async (req, res) => {

  const { userId, subServiceId, serviceId, subServiceName } = req.body;

  try {
    if (!userId || !subServiceId || !serviceId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const user = await Users.findById(userId);

    const subService = await Services.findOne(
      { _id: serviceId },
      {
        subServices: { $elemMatch: { _id: subServiceId } },
      }
    );

    if (!user || !subService) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_3"),
      });
    }

    let Arrayof = [];
    let files = req.files;
    let ServiceId = Math.floor(100000 + Math.random() * 900000);

    // if (files.length === 0) {
    //   return res.status(400).json({
    //     statusCode: 400,
    //     status: req.t("failure_status"),
    //     message: req.t("failure_message_4"),
    //   });
    // }
    await files?.map((file) =>
      Arrayof.push({
        taskImage: file.filename,
        label: file.filename.replace(/\.[^/.]+$/, ""),
      })
    );

    // find address

    const userAddress = [];

    if (req.body.locationType === "home") {
      await userAddress.push(user?.addressesHome);
    } else if (req.body.locationType === "business") {
      await userAddress.push(user?.addressesBusiness);
    } else if (req.body.locationType === "others") {
      await user.addressesOther?.map((address) => userAddress.push(address));
    }

    const serviceTime = {
      from: req.body.serviceStart,
      to: req.body.serviceEnd,
    };

    let hms = req.body.Responsewaittime; // your input string
    let a = hms?.split(":"); // split it at the colons

    // convert to milliseconds
    let miliSec = parseInt(a[0]) * 3600 * 1000 + parseInt(a[1]) * 60 * 1000;

    const providerResponseBy = {
      from: Date.now(),
      to: Date.now() + miliSec,
    };

    const paymentMethod = {
      type: req.body.paymentType,
      amount: req.body.payAmmount,
      currency: req.body.currencyType,
      status: req.body.paymentStatus,
    };

    const coordinates = {
      lat: req.body.lat,
      long: req.body.long,
    };

    const details = {
      UserID: userId,
      ServiceDetails: {
        Servicetime: serviceTime,
        ServiceType: req.body.ServiceType,
        Gender: req.body.Gender || "all",
        ServicerequestId: "BigP" + ServiceId,
        Providertype: req.body.Providertype || null,
        Responsewaittime: req.body.Responsewaittime,
        ProviderResponseBy: providerResponseBy,
        Estimatedtaskduration: req.body.Estimatedtaskduration || null,
        taskDescription: req.body.taskDescription || null,
        taskImages: Arrayof,
        // locationPlaceId:
        //   req.body.locationPlaceId && JSON.parse(req.body.locationPlaceId),
        // locationName: req.body.locationName,
        address: userAddress[0],
        locationName: req.body.locationName,
        coordinates,
        favouriteProviders: req.body.favouriteProviders,
        localproviders: req.body.localproviders,
        locationType: req.body.locationType,
        BasePrice: subService.subServices[0]?.BasePrice,
        AveragePrice: (subService?.subServices[0]?.ServicePrice?.maximum + subService?.subServices[0]?.ServicePrice?.minimum) / 2,
        Peakhours: req.body.Peakhours,
        Payment: paymentMethod,
        subservice: subService.subServices[0]?.name || null,
        bookingstatus: "Pending",
        servicePreference: req.body.servicePreference,
        SubserviceImage: subService.subServices[0]?.imageUrl,
        serviceId: serviceId || null,
        subserviceId: subServiceId || null,
        subServiceName: subServiceName || null
      },
    };

     const addNewBooking = await BookingCatagory.create(details);
     const data =  findProviderBasedOnUserRequest(details.ServiceDetails,res,req,addNewBooking)

  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }

};

// find provider based on the user require

  const findProviderBasedOnUserRequest = async(require, res,req,addNewBooking) => {

   const {lat,long } = require.coordinates

    const provider = await Users.find({
      Providertype: require.Providertype

      }).select([
        "firstName",
        "lastName",
        "gender",
        "dob",
        "providerType",
        "status",
        "userType",
        "userNature",
        "profilePic",
        "languagePreference",
        "reviews",
        "fcmToken",
        "rating",
        "noOfReviews",
        "noOfServices",
        "favoriteCount",
        "memberSince",
        "addressesHome",
        "addressesOther",
        "sosContacts",
        "categories",
      ])
      .exec()

      let newProvider = []

     provider.map((data) => {
        if(data.addressesHome?.lat == lat && data.addressesHome?.long == long){

          data.categories.filter((categoryItem) => categoryItem.subService.subServiceId === require.subserviceId && categoryItem.service.serviceId === require.serviceId  && categoryItem.subService.name === require.subServiceName && newProvider.push(data))

        }

     })

      let filterProvider = []

      newProvider.map((d) => {
         if(d.gender === require.Gender){
          filterProvider.push(d)
         }
        })
       const finalData = {"YourRequest": addNewBooking, "ProviderBasedOnUserRequest": filterProvider}
       try{
        res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        data: finalData,
     });
   }
       catch(err){
        res.status(500).json(catchErr(err, req));
       }

  }



const updatePaymentInfo = async (req, res) => {
  try {
    const { bookingId, paymentType, payAmmount, currencyType, paymentStatus } =
      req.body;
    if (!bookingId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    await BookingCatagory.findByIdAndUpdate(bookingId, {
      "ServiceDetails.Payment.type": paymentType,
      "ServiceDetails.Payment.amount": payAmmount,
      "ServiceDetails.Payment.currency": currencyType,
      "ServiceDetails.Payment.status": paymentStatus,
      "ServiceDetails.Payment.date": Date.now(),
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_46"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const cancelServiceRequrest = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const findBooking = await BookingCatagory.findById(bookingId);

    if (!findBooking) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_38"),
      });
    }

    await BookingCatagory.findByIdAndRemove(bookingId);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_2"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getBookingsList = async (req, res) => {

  const { userId, bookingStatus } = req.body;

  try {
    const newBooking = [];

    var d = new Date();
    d.setHours(d.getHours() - 3);

      const bookings = await BookingCatagory.find(
        {
          UserID: userId,
          "ServiceDetails.bookingstatus": { $in: bookingStatus },
          "ServiceDetails.Servicetime.from": {
            $gte: d, 
          },
        },
        {
          UserID: 1,
          ServiceDetails: 1,
          ProviderDetails: 1,
          acceptedProviderDetails: 1,
        }
      );

       //await bookings.map((booking) =>

       //  newBooking.push({
       //    _id: booking._id,
       //    item: booking?.ServiceDetails,
       //    ProviderDetails: booking?.ProviderDetails,
       //    acceptedProviderDetails: booking?.acceptedProviderDetails,
       //  })
       //);

      await bookings.map((booking) => {

       let ProviderDetails = booking?.ProviderDetails;
       let correctedProviderDetails = ProviderDetails.map((provider) => {
         let providerGender = provider.ProviderDetails.gender.replace(/"/g, '')
         provider.ProviderDetails.gender = providerGender
         return provider
       })
       newBooking.push({
        _id: booking._id,
        item: booking?.ServiceDetails,
        ProviderDetails: correctedProviderDetails,
        acceptedProviderDetails: booking?.acceptedProviderDetails,
      })

      });

      return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        data: newBooking,
      });

  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.query;

    if (!bookingId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const booking = await BookingCatagory.findById(bookingId);
    if (!booking) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: booking,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

 const getListOfLocalProviders = async (req, res) => {

  const { serviceType,serviceId, subServiceId, Gender, providerType, lat, long, range} = req.query
console.log(serviceType,serviceId, subServiceId, Gender, providerType, lat, long, range)
  try {
    let providers = await Users.find();
    return res.send(providers);

    let Providers = await Users.find({
       userNature: "provider",
       status:"active",
       userType: serviceType,
       providerType: providerType,
       genderPreference: Gender,
      })
    //  return res.send(Providers)
      let newLocalProviders = []
      let gender = Gender.split(',')
      const genderPreference = [];

      gender.forEach(element => {
        genderPreference.push( element.charAt(0).toUpperCase() + element.slice(1));
      });

      Providers.map((p)=>{
        p.categories?.filter((c)=>{
          (c.subService.subServiceId === subServiceId &&
           c.approvalStatus === "approved" && c.active === true && c.saveForLater === false) && newLocalProviders.push(p)
          })
       })


      let filterLocalProviders = []
      //TODO: add this range when we decide what we need to do.
      newLocalProviders.map((d) => {

        let distance = coordsDistance(lat, long, d.addressesHome?.lat, d.addressesHome?.long);
        var num = range.replace(/[^0-9]/g,'');

        if(distance <= range.split('')[0]) {


          if(util.isEquals(Gender, "all")) {
              filterLocalProviders.push(d)
            }
            else if(genderPreference.includes(d.gender)) {
              filterLocalProviders.push(d)
            }
          }

        })

        /*let localProviders = []

        if(isEqual(Gender, "all")) {
          localProviders = newLocalProviders
        }else {
          filterLocalProviders.map((provider)=>{
            if(isEqual(Gender, provider.gender)) {
              localProviders.push(provider)
            }
          })
        }*/

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: filterLocalProviders,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};


const getFevProviderList = async (req, res) => {

  try {
    const { userId } = req.params;
    const  {long, lat, serviceMode, subCategory}=  req.body;
    if(!long || !lat || !serviceMode || !userId || !subCategory){

      return res.status(400).json({"status":"invalid input"});
    }
    const user = await Users.findById(userId, {favouriteProviders: 1,addressesHome:1}).exec();

    console.log(user.addressesHome);

    const userdetails = user.favouriteProviders?.map((x) => x);

    console.log(userdetails);
    // "category.helpNow":serviceMode
    const getDetailsOfUser = await Users.find(
      { _id: { $in: userdetails?.map((x) => x.providerId)},"categories.helpNow": serviceMode,},
      { firstName: 1, lastName: 1, profilePic: 1 , email: 1, mobileNumber:1,
        gender :1,verified: 1 , userType: 1, status: 1, memberSince : 1, rating:1, noOfReviews: 1 , noOfServices:1,
        favoriteCount:1,distance:1,cancellationPercent: 1,nextHourDiscountPercent:1,peakHourSurchargePercent:1,
        languagePreference: 1, complain:1,optionalDetails:1,currentlocation:1,
        providerType :1,  addressesHome:1, addressesBusiness: 1 , addressesOther:1, categories: 1
      },
    ).exec();
    filtereduser = []
    getDetailsOfUser.forEach((ele)=>{
         ele.categories.forEach((element)=>{
          if(element.subService?.name == "Iron service" && (coordsDistance(lat, long, ele.addressesHome?.lat, ele.addressesHome?.long) > parseInt(ele.serviceRadius))){
            filtereduser.push(ele)
          }
         })
    })
    res.status(200).json({
      count:getDetailsOfUser.length,
      statusCode: 200,
      status: req.t("success_status"),
      data:filtereduser
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const addToFavouriteProviderList = async (req, res) => {
  try {
    // let now = new Date(),
    //   create = dateFormat(now, "dd-mm-yyyy hh:MM:ss TT");
    const { userId, providerId } = req.body;
    if (!providerId ) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("Provider Id is not defined"),
      });
    }

    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("User Id is not defined"),
      });
    }

    const existingProvider = await Users.findOne({
      _id: userId ,
      "favouriteProviders.providerId": req.body.providerId,
    });

    if (existingProvider) {
      return res.status(200).json({
        statusCode: 500,
        status: req.t("exist_status"),
        message: req.t('Provider already exists in favorite list'),
      });
    }

    const favPro = {
      providerId: req.body.providerId,
      favStatus: "Pending",
    };

    await Users.findByIdAndUpdate(req.body.userId, {
      $addToSet: {
        favouriteProviders: favPro,
      },
    }).exec();

    const provider = await Users.findOne({
      _id: providerId ,
    });

    await Users.findByIdAndUpdate(providerId, {
      favoriteCount: provider.favoriteCount + 1,
    }).exec();
    
    // const addFav = await Users.find({
    //   _id: ObjectId(req.params.userId),
    // }).exec();
    // const Prov = await Provider.find(
    //   { _id: req.body.providerId },
    //   { firstName: 1, profilePic: 1, lastName: 1, fcmToken: 1 }
    // ).exec();

    // const Noti = {
    //   firstName: Prov[0].firstName,
    //   lastName: Prov[0].lastName,
    //   profilePic: Prov[0].profilePic,
    //   pageName: "favorite",
    //   fcmToken: Prov[0].fcmToken,
    //   Type: "fromUser",
    // };

    // new NotificationModel({
    //   firstName: addFav[0].firstName,
    //   lastName: addFav[0].lastName,
    //   profilePic: addFav[0].profilePic,
    //   ProviderId: req.body.providerId,
    //   UserId: req.params.id,
    //   // favStatus :
    //   Type: "fromUser",
    //   CreatedAt: create,
    //   Time: now.toString(),
    // }).save();

    // const favNotification = await utils.SendNotification(Noti);

    res.json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_3"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const removeFromFev = async (req, res) => {
  try {
    const { userId, providerId } = req.body;

    if (!userId || !providerId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const existingProvider = await Users.findOne({
      _id: userId ,
      "favouriteProviders.providerId": req.body.providerId,
    });

    if (existingProvider === null) {
      return res.status(200).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t('Provider already removed from favorite list'),
      });
    }

    await Users.findByIdAndUpdate(userId, {
      $pull: { favouriteProviders: { providerId } },
    });

    const provider = await Users.findOne({
      _id: providerId ,
    });

    await Users.findByIdAndUpdate(providerId, {
      favoriteCount: provider.favoriteCount - 1,
    }).exec();

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_4"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getAvoidProvidersList = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findById(userId, { avoidList: 1 }).exec();

    const userdetails = user.avoidList.map((x) => x);
    console.log(userdetails)

    const getDetailsOfUser = await Users.find(
      { _id: { $in: userdetails.map((x) => x.providerId) } },
      { firstName: 1, lastName: 1, profilePic: 1 , email: 1, mobileNumber:1,
        gender :1,verified: 1 , userType: 1, status: 1, memberSince : 1, rating:1, noOfReviews: 1 , noOfServices:1,
        favoriteCount:1,distance:1,cancellationPercent: 1, nextHourDiscountPercent:1,peakHourSurchargePercent:1,
        languagePreference: 1, complain:1,optionalDetails:1,currentlocation:1,
        providerType :1, addressesHome:1, addressesBusiness: 1 , addressesOther:1, categories: 1,reviews:1
      },
    ).exec();

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),

      data: getDetailsOfUser,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const addToAvoidProvidersList = async (req, res) => {
  try {
    // let now = new Date(),
    //   create = dateFormat(now, "dd-mm-yyyy hh:MM:ss TT");
    const { userId } = req.body;

    const existingProvider = await Users.findOne({
     _id: userId ,
      "avoidList.providerId": req.body.providerId,
    });

    if (existingProvider) {
      return res.status(200).json({
        statusCode: 500,
        status: req.t("exist_status"),
        message: req.t("Provider already exists in avoid list"),
      });
    }

    const AvoidPro = {
      providerId: req.body.providerId,
    };

    await Users.findByIdAndUpdate(req.body.userId, {
      $addToSet: {
        avoidList: AvoidPro,
      },
    }).exec();

    // const addFav = await Users.find({
    //   _id: ObjectId(req.params.userId),
    // }).exec();
    // const Prov = await Provider.find(
    //   { _id: req.body.providerId },
    //   { firstName: 1, profilePic: 1, lastName: 1, fcmToken: 1 }
    // ).exec();

    // const Noti = {
    //   firstName: Prov[0].firstName,
    //   lastName: Prov[0].lastName,
    //   profilePic: Prov[0].profilePic,
    //   pageName: "favorite",
    //   fcmToken: Prov[0].fcmToken,
    //   Type: "fromUser",
    // };

    // new NotificationModel({
    //   firstName: addFav[0].firstName,
    //   lastName: addFav[0].lastName,
    //   profilePic: addFav[0].profilePic,
    //   ProviderId: req.body.providerId,
    //   UserId: req.params.id,
    //   // favStatus :
    //   Type: "fromUser",
    //   CreatedAt: create,
    //   Time: now.toString(),
    // }).save();

    // const favNotification = await utils.SendNotification(Noti);

    res.json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_5"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const removeFromAvoidProvidersList = async (req, res) => {
  try {
    const { userId, providerId } = req.body;

    if (!userId || !providerId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    await Users.findByIdAndUpdate(userId, {
      $pull: { avoidList: { providerId } },
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_4"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getProviderResponseList = async (req, res) => {
  try {
    const { bookingId } = req.query;
    const provider = await BookingCatagory.find(
      { _id: bookingId },
      { ProviderDetails: 1 }
    );

    if (provider.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_7"),
      });
    }

    const providerDetails = provider.map((x) => x.ProviderDetails);

    const getDetailsOfProvider = await Users.find(
      { _id: { $in: providerDetails[0].map((x) => x.ProviderId) } },
      { firstName: 1, lastName: 1, profilePic: 1 }
    ).exec();

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: getDetailsOfProvider,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getProviderCostDetails = async (req, res) => {
  try {
    const { bookingId, providerId } = req.query;

    if (!bookingId || !providerId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const booking = await BookingCatagory.findOne(
      { _id: bookingId, "ProviderDetails.ProviderId": providerId },
      { ProviderDetails: 1 }
    );

    if (!booking) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    const costDetails = await booking.ProviderDetails.filter(
      (provider) => provider.ProviderId === providerId
    );

    res.status(200).json({
      statusCode: 400,
      status: req.t("success_status"),
      data: costDetails[1].costDetails,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};


const acceptProviderResponse = async (req, res) => {
  try {
    const { bookingId, providerId } = req.body;

    if (!bookingId || !providerId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    // check booking status
    // const getBookingStatus = await BookingCatagory.findOne({
    //   _id: bookingId,
    //   "ServiceDetails.bookingstatus": "scheduled",
    // });

    // if (getBookingStatus) {
    //   return res.status(400).json({
    //     statusCode: 400,
    //     status: req.t("failure_status"),
    //     message: req.t("failure_message_31"),
    //   });
    // }

    let otp = Math.floor(1000 + Math.random() * 9000);

    const booking = await BookingCatagory.findOne({ _id: bookingId });
    console.log(booking)

    const provider = await booking.ProviderDetails?.filter(
      (provider) => provider.ProviderDetails.ProviderId === providerId
    );


    // getting provider details
    const getDetailsOfProvider = await Users.findById(
      provider[0].ProviderDetails.ProviderId
    ).exec();

    const newProvider = {
      ProviderId: provider[0].ProviderDetails?.ProviderId,
      firstName: getDetailsOfProvider.firstName,
      lastName: getDetailsOfProvider.lastName,
      profilePic: getDetailsOfProvider.profilePic,
      gender: getDetailsOfProvider.gender,
      rating: 3.5,
      noOfReviews: 100,
      favoriteCount: 30,
      cancellationPercent: 20,
      noOfJobs: 25,
      age: 30,
      memberSince: "May 2019",
      ProviderStatus: "providerStatus",
      optionalDetails: getDetailsOfProvider.optionalDetails,
    };

    const acceptProviderDetails = {
      Costdetails: provider[0].costDetails,
      ServicerequestId: booking.ServicerequestId,
      ProviderId: provider[0].ProviderId,
      Providerdetails: newProvider,
    };

    await BookingCatagory.findByIdAndUpdate(bookingId, {
      "ServiceDetails.bookingstatus": "scheduled",
      "ServiceDetails.bookedon": providerId,
      "ServiceDetails.OTP": otp,
      "ServiceDetails.OTPVerify": false,
      acceptedProviderDetails: acceptProviderDetails,
    }).exec();

    const getBoking = await BookingCatagory.findById(bookingId, {
      acceptedProviderDetails: 1,
    });

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: getBoking,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getReqForAdditionalLaborMaterial = async (req, res) => {
  try {
    const { bookingId } = req.query;

    if (!bookingId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const booking = await BookingCatagory.findOne(
      {
        _id: bookingId,
      },
      { "ServiceDetails.requestMoreLaborMaterial": 1 }
    );

    if (!booking) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: booking.ServiceDetails.requestMoreLaborMaterial,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getReqForReshedule = async (req, res) => {
  try {
    const { bookingId } = req.query;

    if (!bookingId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const rescaduleDetails = await BookingCatagory.findById(bookingId, {
      "ServiceDetails.requestResheduling": 1,
    });

    if (!rescaduleDetails) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    res.status(200).json({
      statusCode: 400,
      status: req.t("success_status"),
      data: rescaduleDetails,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const approveOrDeclineRescadule = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    if (status === "approve" || status === "decline") {
      const rescaduleDetails = await BookingCatagory.findById(bookingId, {
        "ServiceDetails.requestResheduling": 1,
      });

      if (!rescaduleDetails.ServiceDetails.requestResheduling) {
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: req.t("failure_message_5"),
        });
      }

      if (status === "approve") {
        const oldDetails = await BookingCatagory.findById(bookingId, {
          acceptedProviderDetails: 1,
        });

        // Adding new scadule
        await BookingCatagory.findByIdAndUpdate(bookingId, {
          "acceptedProviderDetails.Costdetails.rescaduleDiscount":
            oldDetails.acceptedProviderDetails.Costdetails.rescaduleDiscount +
            rescaduleDetails.ServiceDetails.requestResheduling
              .rescheduleDiscount,
          "ServiceDetails.Servicetime.from":
            rescaduleDetails.ServiceDetails.requestResheduling.time,
        });

        await BookingCatagory.findByIdAndUpdate(bookingId, {
          "ServiceDetails.requestResheduling.comment": req.body.comment,
          "ServiceDetails.requestResheduling.status": "approve",
        });

        return res.status(200).json({
          statusCode: 200,
          status: req.t("success_status"),
          message: req.t("success_message_32"),
        });
      }

      await BookingCatagory.findByIdAndUpdate(bookingId, {
        "ServiceDetails.requestResheduling.comment": req.body.comment,
        "ServiceDetails.requestResheduling.status": "decline",
      });

      return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        message: req.t("success_message_33"),
      });
    }

    res.status(400).json({
      statusCode: 400,
      status: req.t("failure_status"),
      message: req.t("failure_message_33"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getReqForAdditionalTime = async (req, res) => {
  try {
    const { bookingId } = req.query;

    if (!bookingId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const rescaduleDetails = await BookingCatagory.findById(bookingId, {
      "ServiceDetails.requestMoreTime": 1,
    });

    if (!rescaduleDetails) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    res.status(200).json({
      statusCode: 400,
      status: req.t("success_status"),
      data: rescaduleDetails,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const approveOrDeclineAdditionalTime = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }

    if (status === "approve" || status === "decline") {
      const rescaduleDetails = await BookingCatagory.findById(bookingId, {
        "ServiceDetails.requestMoreTime": 1,
      });

      if (!rescaduleDetails.ServiceDetails.requestMoreTime) {
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: req.t("failure_message_5"),
        });
      }

      if (status === "approve") {
        const oldDetails = await BookingCatagory.findById(bookingId, {
          acceptedProviderDetails: 1,
          ServiceDetails: 1,
        });

        let hms =
          rescaduleDetails?.ServiceDetails?.requestMoreTime?.additionalTime; // your input string
        let a = hms?.split(":"); // split it at the colons

        // convert to milliseconds
        let miliSec = parseInt(a[0]) * 3600 * 1000 + parseInt(a[1]) * 60 * 1000;

        let newServiceTime = {
          from: oldDetails.ServiceDetails.Servicetime.from,
          to:
            (oldDetails?.ServiceDetails?.Servicetime?.to
              ? new Date(oldDetails?.ServiceDetails?.Servicetime?.to).getTime()
              : Date.now()) + miliSec,
        };

        await BookingCatagory.findByIdAndUpdate(bookingId, {
          "acceptedProviderDetails.Costdetails.otherCost":
            (oldDetails.acceptedProviderDetails.Costdetails.otherCost || null) +
            rescaduleDetails.ServiceDetails.requestMoreTime.additionalCost,
          "ServiceDetails.Servicetime": newServiceTime,
        });

        await BookingCatagory.findByIdAndUpdate(bookingId, {
          "ServiceDetails.requestMoreTime.status": "approve",
          "ServiceDetails.requestMoreTime.comment": req.body.comment,
        });

        return res.status(200).json({
          statusCode: 200,
          status: req.t("success_status"),
          message: req.t("success_message_32"),
        });
      }

      await BookingCatagory.findByIdAndUpdate(bookingId, {
        "ServiceDetails.requestMoreTime.status": "decline",
        "ServiceDetails.requestMoreTime.comment": req.body.comment,
      });

      return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        message: req.t("success_message_33"),
      });
    }

    res.status(400).json({
      statusCode: 400,
      status: req.t("failure_status"),
      message: req.t("failure_message_33"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const approveOrDeclineAdditionalLaborMaterial = async (req, res) => {
  try {
    const { bookingId, additionalLabourMaterial } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_6"),
      });
    }

    const booking = await BookingCatagory.findOne(
      {
        _id: bookingId,
      },
      { "ServiceDetails.requestMoreLaborMaterial": 1 }
    );

    if (!booking) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    if (additionalLabourMaterial.status === "decline") {
      await BookingCatagory.findOneAndUpdate(
        {
          _id: bookingId,
        },
        {
          "ServiceDetails.requestMoreLaborMaterial.status": "decline",
          "ServiceDetails.requestMoreLaborMaterial.comment": req.body.comment,
        }
      );

      return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        message: req.t("success_message_28"),
      });
    }

    if (additionalLabourMaterial.status === "approve") {
      if (
        !additionalLabourMaterial.labor &&
        !additionalLabourMaterial.material
      ) {
        return res.status(400).json({
          statusCode: 400,
          status: req.t("failure_status"),
          message: req.t("failure_message_32"),
        });
      }

      // const oldData = await BookingCatagory.findById(bookingId, {
      //   "acceptedProviderDetails.Costdetails": 1,
      // });

      // let laborTotal =
      //   additionalLabourMaterial?.laborTotal +
      //   oldData?.acceptedProviderDetails?.Costdetails?.additionalLabourMaterial
      //     ?.laborTotal;
      // let materialTotal =
      //   additionalLabourMaterial?.materialTotal +
      //   oldData?.acceptedProviderDetails?.Costdetails?.additionalLabourMaterial
      //     ?.materialTotal;

      // let newTotal =
      //   oldData?.acceptedProviderDetails?.Costdetails?.additionalLabourMaterial
      //     ?.laborMaterialTotal +
      //   laborTotal +
      //   materialTotal;

      await BookingCatagory.findOneAndUpdate(
        {
          _id: bookingId,
        },
        {
          $push: {
            "acceptedProviderDetails.Costdetails.additionalLabourMaterial.labor":
              additionalLabourMaterial?.labor,
            "acceptedProviderDetails.Costdetails.additionalLabourMaterial.material":
              additionalLabourMaterial?.material,
          },
          "acceptedProviderDetails.Costdetails.additionalLabourMaterial.laborTotal": 100,
          "acceptedProviderDetails.Costdetails.additionalLabourMaterial.materialTotal": 200,
          "acceptedProviderDetails.Costdetails.additionalLabourMaterial.laborMaterialTotal": 300,
          "ServiceDetails.requestMoreLaborMaterial.status": "approve",
          "ServiceDetails.requestMoreLaborMaterial.comment": req.body?.comment,
        }
      );

      // await BookingCatagory.findByIdAndUpdate(bookingId, {
      //   "ServiceDetails.requestMoreLaborMaterial.status": "approve",
      //   "ServiceDetails.requestMoreLaborMaterial.comment": req.body.comment,
      // });

      return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        message: req.t("success_message_27"),
      });
    }

    res.status(400).json({
      statusCode: 400,
      status: req.t("failure_status"),
      message: req.t("failure_message_33"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const addRatingToProvider = async (req, res) => {
  try {
    const { bookingId, consumerId, ratings, experience, description } =
      req.body;

    // check for valid fields
    if (!bookingId || !consumerId || !ratings || !experience || !description) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_2"),
      });
    }


    // check for booking
    const getBookingProvider = await BookingCatagory.findOne(
      { _id: bookingId, UserID: consumerId },
      { "ServiceDetails.bookedon": 1 }
    );

    const consumerName = await Users.findById(consumerId, { firstName: 1 });

    const { bookedon } = await getBookingProvider.ServiceDetails;

    if (!bookedon) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_7"),
      });
    }
    const ReviewDetails = {
      ratings,
      experience,
      description,
      UserId: consumerId,
      consumerName: consumerName.firstName,
      createdAt: Date.now(),
    };

    // add rating on bookings
    await BookingCatagory.findOneAndUpdate(
      { _id: bookingId },
      {
        $set: {
          "ServiceDetails.ServiceReviews.ratings": ratings,
          "ServiceDetails.ServiceReviews.experience": experience,
          "ServiceDetails.ServiceReviews.description": description,
          "ServiceDetails.ServiceReviews.UserId": consumerId,
          "ServiceDetails.ServiceReviews.consumerName": consumerName.firstName,
          "ServiceDetails.ServiceReviews.createdAt": Date.now(),
        },
      }
    );

    const provider = await Users.findOne({
      _id: bookedon ,
    });

    // add ratings on provider profile
    const Review = await Users.find({
      _id: bookedon,
      "reviews.UserId": consumerId,
    }).exec();
    if (Review.length !== 0) {
      await Users.findByIdAndUpdate(
        { _id: bookedon, "reviews.UserId": consumerId },
        {
          $set: { reviews: ReviewDetails },
        },
        { new: true }
      ).exec();
      const ReviewsUpdate = await Users.findById(
        { _id: bookedon },
        { reviews: 1 }
      ).exec();
      await Users.findByIdAndUpdate(bookedon, {
        noOfReviews: provider.reviews.length,
      }).exec();
      res.json({
        statusCode: 200,
        status: req.t("success_status"),
        data: ReviewsUpdate,
      });
    } else {
      await Users.findByIdAndUpdate(
        { _id: bookedon },
        { $set: { reviews: ReviewDetails } }
      ).exec();
      const ReviewsUpdate2 = await Users.findById(
        { _id: bookedon },
        { reviews: 1 }
      ).exec();
      await Users.findByIdAndUpdate(bookedon, {
        noOfReviews: provider.reviews.length,
      }).exec();
      res.json({
        statusCode: 200,
        status: req.t("success_status"),
        data: ReviewsUpdate2,
      });
    }
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const deleteProviderRating = async (req, res) => {
  try {
    // const { bookingId, consumerId } = req.body;

    // if(!bookingId || !consumerId){
    //   return res.status(400).json({
    //     statusCode: 400,
    //     status: "failed",
    //     message : "please provide valid data"
    //   })
    // }

    // await BookingCatagory.findByIdAndUpdate(bookingId, {
    //   $pull : "ServiceDetails.ServiceReviews"
    // }).exac();

    // const getBookingProvider = await BookingCatagory.findOne({_id : bookingId, UserID : consumerId}, {"ServiceDetails.bookedon": 1});

    // const { bookedon } = await getBookingProvider.ServiceDetails

    // await Users.findByIdAndUpdate(
    //   { _id: bookedon },
    //   { $pull: { reviews: ReviewDetails } }
    // ).exec();

    res.send(req.t("working_route"));
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getExperieceQuestionsList = async (req, res) => {
  try {
    const questions = await Experience.find({}, { experienceQuestion: 1 });
    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: questions,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getExperieceQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Experience.findById(questionId, {
      experienceQuestion: 1,
    });
    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: question,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getIssueQuestionsList = async (req, res) => {
  try {
    const questions = await Issue.find({}, { issueQuestion: 1 });
    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: questions,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getIssueQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Issue.findById(questionId, {
      issueQuestion: 1,
    });
    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: question,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const submitUserIssue = async (req, res) => {
  try {
    const { bookingId, issue, description } = req.body;

    const booking = await BookingCatagory.findById(bookingId);

    if (!booking) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    let Arrayof = [];
    let files = req.files;

    await files?.map((file) =>
      Arrayof.push({
        document: file.filename,
      })
    );

    const issueObject = {
      bookingId,
      issue,
      description,
      uploadIssue: Arrayof,
    };

    const existIssue = await UserIssues.findOne({ bookingId });

    if (existIssue) {
      await UserIssues.findOneAndUpdate({ bookingId }, issueObject);

      return res.status(200).json({
        statusCode: 200,
        status: req.t("success_status"),
        message: "Issue successfully updated",
      });
    }

    const Data = await UserIssues.create(issueObject);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: Data,
    });
  } catch (err) {
    res.status(400).json(catchErr(err, req));
  }
};

const updateUserIssues = async (req, res) => {
  try {
    const { userIssueId, issue, description } = req.body;

    const userIssue = await UserIssues.findById(userIssueId);

    if (!userIssue) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    let Arrayof = [];
    let files = req.files;

    await files.map((file) =>
      Arrayof.push({
        document: file.filename,
      })
    );

    await UserIssues.findByIdAndUpdate(userIssueId, {
      $set: {
        issue,
        description,
        uploadIssue: Arrayof,
      },
    });

    const updatedIssue = await UserIssues.findById(userIssueId);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: updatedIssue,
    });
  } catch (err) {
    res.status(400).json(catchErr(err, req));
  }
};

const deleteUserIssue = async (req, res) => {
  const { userIssueId } = req.query;
  try {
    const userIssue = await UserIssues.findById(userIssueId);

    if (!userIssue) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    await UserIssues.findByIdAndDelete(userIssueId);

    res.status(200).json({
      statusCode: 400,
      status: req.t("success_status"),
      message: req.t("success_message_26"),
    });
  } catch (err) {
    res.status(400).json(catchErr(err, req));
  }
};

const getServiceHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findById(userId)
    const userNature = user.userNature

    let serviceHistory = [];
    if(userNature == "consumer") {

      serviceHistory = await BookingCatagory.find({ UserID: userId })
                                            .select("-ProviderDetails")
                                            .sort({"ServiceDetails.Servicetime.from": -1});

    }
    else if(userNature == "provider") {
      serviceHistory = await BookingCatagory.find({"acceptedProviderDetails.Providerdetails.ProviderId":userId})
                                            .select("-ProviderDetails")
                                            .sort({"ServiceDetails.Servicetime.from":-1})

    }

    const newArray = [];

    serviceHistory.map(
      (booking) =>
        (booking.ServiceDetails.bookingstatus === "completed" ||
          booking.ServiceDetails.bookingstatus === "cancelled") &&
        newArray.push(booking)
    );

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: serviceHistory,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const uploadCompletedTask = async (req, res) => {
  try {
    const { bookingId } = req.body;

    let Arrayof = [];
    let files = req.files;

    await files?.map((file) =>
      Arrayof.push({
        taskImage: file.filename,
        label: file.filename.replace(/\.[^/.]+$/, ""),
      })
    );

    await BookingCatagory.findByIdAndUpdate(bookingId, {
      "ServiceDetails.uploadTaskComplete": Arrayof,
    });

    const booking = await BookingCatagory.findById(bookingId);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: booking,
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

module.exports = {
  requestService,
  updatePaymentInfo,
  cancelServiceRequrest,
  getListOfLocalProviders,
  getBookingsList,
  getBookingDetails,
  addToFavouriteProviderList,
  getFevProviderList,
  getAvoidProvidersList,
  addToAvoidProvidersList,
  removeFromAvoidProvidersList,
  getProviderResponseList,
  getProviderCostDetails,
  acceptProviderResponse,
  getReqForReshedule,
  approveOrDeclineRescadule,
  getReqForAdditionalLaborMaterial,
  approveOrDeclineAdditionalLaborMaterial,
  approveOrDeclineAdditionalTime,
  getReqForAdditionalTime,
  addRatingToProvider,
  deleteProviderRating,
  removeFromFev,
  getExperieceQuestionsList,
  getExperieceQuestion,
  getIssueQuestionsList,
  getIssueQuestion,
  submitUserIssue,
  updateUserIssues,
  deleteUserIssue,
  getServiceHistory,
  uploadCompletedTask,
};
