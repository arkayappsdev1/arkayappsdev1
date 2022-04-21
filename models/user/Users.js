const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

function current_month_and_year_in_string() {
  var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
  var today = new Date();
  var formattedDate = monthNames[today.getMonth()] + ' ' + today.getFullYear();
  return formattedDate;
}

let SecurityQuestion = new Schema({
  question: {
    type: String,
    required: true,
    unique: false,
    sparse: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

let Address = new Schema({
  PlaceName: {
    type: String,
  },
  PlaceId: {
    type: Object,
    // required: true,
  },
  HomeAddress: {
    type: String,
    // required: true,
  },
  HouseName: {
    type: String,
    // required: true,
  },
  HouseNo: {
    type: String,
    // required: true,
  },
  Apartment: {
    type: String,
  },
  Timestamp: {
    type: Number,
    // required: true,
  },
  AddressType: {
    type: String,
  },
  lat: { type: Number },
  long: { type: Number },
  // Others : {
  //     type : String
  // }
});

let AdditionalLabourMaterial = new Schema({
  labour: {
    type: [],
  },
  material: {
    type: [],
  },
});

let costDetails = new Schema({
  Labourcost: {
    type: Number,
  },
  Peakhoursurcharge: {
    type: Number,
  },
  Nexthourdiscount: {
    type: Number,
  },
  Additionaldiscount: {
    type: Number,
  },
  Laboursubtotal: {
    type: Number,
  },
  Additionallabourmaterial: {
    type: AdditionalLabourMaterial,
  },
  Totalcost: {
    type: Number,
  },
  ProviderId: {
    type: String,
  },
});

let AddressOther = new Schema({
  PlaceName: {
    type: String,
    // required: true,
    // unique: true
  },
  PlaceId: {
    type: Object,
    required: true,
  },
  HomeAddress: {
    type: String,
    required: true,
  },
  HouseName: {
    type: String,
    required: true,
  },
  HouseNo: {
    type: String,
    required: true,
  },
  Apartment: {
    type: String,
  },
  Timestamp: {
    type: Number,
    required: true,
  },
  AddressType: {
    type: String,
  },
  Others: {
    type: String,
  },
});

let Contact = new Schema({
  name: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  // priority: {
  //   type: String,
  //   //  unique: true
  // },
  reminder: {
    type: String,
    lowercase: true,
    //required: true
  },
});

let Document = new Schema({
  document: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    // required: true
  },
  // UserType : {
  //     type : String,
  // }
  // verified: {
  //     type: Boolean,
  //     // required: true,
  //     // trim: true
  // }
  docName: { type: String },
  expire_date: {
    type: Date,
  },
});

let CatagoryDocument = new Schema({
  categoryDocumet: {
    type: String,
    // required: true,
  },
  label: {
    type: String,
    // required: true
  },
  docName: { type: String },
  expire_date: { type: Date },
  // UserType : {
  //     type : String,
  // }
  // verified: {
  //     type: Boolean,
  //     // required: true,
  //     // trim: true
  // }
});

let Complaints = new Schema({
  complainId: {
    type: String,
  },
  status: {
    type: String,
  },
  raisedon: {
    type: String,
  },
  customer: {
    type: String,
  },
  replay: {
    type: String,
  },
});

let Locations = new Schema({
  Placeid: {
    type: String,
  },
  Name: {
    type: String,
  },
  UserType: {
    type: String,
  },
});

let Booking = new Schema({
  Servicetime: {
    type: [],
  },
  ServiceType: {
    type: String,
  },
  Gender: { type: [] },
  Providertype: { type: [] },
  Responsewaittime: { type: String },
  Estimatedtaskduration: { type: String },
  interstingsthings: { type: String },
  documents: [Document],

  // bookingId: {
  //     type: Number,
  // },
  bookedon: {
    type: String,
  },
  ProviderId: {
    type: [String],
  },
  service: {
    type: String,
  },
  subservice: {
    type: String,
  },
  bookingstatus: {
    type: String,
  },
  ServicerequestId: {
    type: String,
  },
  Schedulestatus: {
    type: String,
  },
  // paymentstatus: {
  //     type: String
  // },

  Costdetails: {
    type: [costDetails],
  },
  UserID: {
    type: String,
  },
  locationPlaceId: {
    type: Object,
  },
  locationName: {
    type: String,
  },
  locationType: {
    type: String,
  },
  BasePrice: {
    type: String,
  },
  Peakhours: {
    type: String,
  },
  placeId: {
    type: String,
  },
  serviceId: {
    type: String,
  },
  SubserviceImage: {
    type: String,
  },
  subserviceId: {
    type: String,
  },
});

let currentLocations = new Schema({
  // GeoJSON Format
  type: {
    type: String,
    default: "Point",
    trim: true,
  },
  coordinates: {
    type: [Number],
    index: "2dsphere",
  },
});

let ServiceMinified = new Schema({
  serviceId: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
});

let SubServiceMinified = new Schema({
  subServiceId: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
});

let Category = new Schema({
  categoryName: {
    type: String,
  },
  service: {
    type: ServiceMinified,
    trim: true,
  },
  subService: {
    type: SubServiceMinified,
  },
  hourlyRate: {
    type: String, // service charge per hour
    trim: true,
  },
  nextHourDiscount: {
    type: String, // discount in percentage
    trim: true,
  },
  peakHourSurcharge: {
    type: String,
    // required: true,
    // trim: true,
  },
  taskDuration: {
    type: String,
    trim: true,
  },
  serviceRadius: {
    type: String,
    trim: true,
  },
  experience: {
    type: String, // Number of months of experience in the respective category
    trim: true,
  },
  servicePreference: {
    type: String, // home || business
    enum: ["all", "business", "home"],
    default: "all",
    trim: true,
  },
  categoryDocuments: {
    type: [CatagoryDocument],
    // trim: true,
  },
  // CostDetails : {
  //   type : CostDetails
  // },
  genderPreference: {
    type: [String],
    enum: ["all", "male", "female", "other"],
    default: "all",
    trim: true,
  },
  active: {
    type: Boolean,
    default: false,
    // required: true,
    // trim: true,
  },
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected", "saveForLater"],
    // default: false,
    default: "pending",
  },
  helpNow: {
    type: String,
    lowercase: true,
    trim: true,
  },
  saveForLater: {
    type: Boolean,
    default: false,
  },
  docCategoryApproval: {
    type: String,
  },
});

let Education = new Schema({
  school: {
    type: String,
    required: false,
    trim: true,
  },
  college: {
    type: String,
    required: false,
    trim: true,
  },
  university: {
    type: String,
    required: false,
    trim: true,
  },
  degree: {
    type: String,
    required: false,
    trim: true,
  },
});

let EmailValidator = new Schema({
  value: {
    type: String,
    // required: false,
    // sparse: true,
    // trim: true,
    // unique: true
  },
  verified: {
    type: Boolean,
    required: true,
    trim: true,
  },
  OTP: { type: Number },
});

let AdditionalEmail = new Schema({
  value: {
    type: String,
    // required: false,
    // sparse: true,
    // trim: true,
    // unique: true
  },
  verified: {
    type: Boolean,
    required: true,
    trim: true,
  },
  OTP: { type: Number },
});
let AdditionalEmailBusiness = new Schema({
  value: {
    type: String,
    // required: false,
    // sparse: true,
    // trim: true,
    // unique: true
  },
  verified: {
    type: Boolean,
    required: true,
    trim: true,
  },
  OTP: { type: Number },
});

let MobileNumberValidator = new Schema({
  value: {
    type: Number,
    required: true,
    // trim: true,
  },
  verified: {
    type: Boolean,
    required: true,
    trim: true,
  },
  OTP: { type: Number, select: false },
});

let AdditionalMobileNumber = new Schema({
  value: {
    type: Number,
    // required: true,
    // trim: true,
  },
  verified: {
    type: Boolean,
    required: true,
    trim: true,
  },
  OTP: { type: Number },
});
let AdditionalMobileNumberBusiness = new Schema({
  value: {
    type: Number,
    // required: true,
    // trim: true,
  },
  verified: {
    type: Boolean,
    required: true,
    trim: true,
  },
  OTP: { type: Number },
});

let SocialMedia = new Schema({
  id: {
    type: String,
  },
  link: {
    type: String,
    // required: true,
    // sparse: true,
    // trim: true,
    // unique: true
  },
  media: {
    type: String,
    required: true,
    trim: true,
  },
});

let OptionalDetails = new Schema({
  sexualOrientation: {
    type: String,
    required: false,
    trim: true,
  },
  maritalStatus: {
    type: String,
    required: false,
    trim: true,
  },
  AdditionalEmail: { type: AdditionalEmail },

  // mobileNumber: {
  //     type: MobileNumberValidator
  // },
  AdditionalMobileNumber: { type: AdditionalMobileNumber },
  alternateEmail: {
    type: EmailValidator,
    required: false,
  },
  age: {
    type: Number,
  },
  education: {
    type: Education,
    required: false,
    trim: true,
  },
  languagesSpoken: {
    type: String,
    required: false,
    trim: true,
  },
  birthPlace: {
    type: String,
    required: false,
    trim: true,
  },
  hobbies: {
    type: String,
    required: false,
    trim: true,
  },
  occupation: {
    type: String,
    required: false,
    trim: true,
  },
  interestingThings: {
    type: String,
    required: false,
    trim: true,
  },
  socialMediaLinks: [SocialMedia],
  //  {
  //     type: Array,"default" : [],
  //     required: false,
  //     trim: true
  // }
});

let OptionalDetailsForBusiness = new Schema({
  LongInBusiness: {
    type: [String],
    required: false,
    trim: true,
  },
  LanguageSpoken: {
    type: [String],
    required: false,
  },
  businessProfile: {
    type: String,
  },
  AdditionalEmail: { type: AdditionalEmailBusiness },

  // mobileNumber: {
  //     type: MobileNumberValidator
  // },
  AdditionalMobileNumber: { type: AdditionalMobileNumberBusiness },
  Employees: {
    type: String,
    required: false,
  },

  BusinessWebsite: {
    type: String,
    required: false,
    trim: true,
  },

  interestingThings: {
    type: String,
    required: false,
    trim: true,
  },
  socialMediaLinks: [SocialMedia],
  // type: [String],
  // required: false,
  // trim: true
});

// Ratings and Reviews
// let Review = new Schema({
//   comment: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   starRating: {
//     type: Number,
//     required: true,
//     trim: true,
//   },
//   service: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   subService: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   user: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   createdAt: {
//     type: Date,
//     required: false,
//     trim: true,
//   },
//   description : {
//     type : String
//   },
//   experience : {
//     type : String
//   },
//   likes: {
//     type: Number,
//   },
//   dislikes: {
//     type: Number,
//   },
//   providerId: {
//     type: String,
//   },
// });

let Review = new Schema({
  ratings: {
    type: Number,
    required: true,
    trim: true,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  experience: {
    type: String,
  },
  UserId: {
    type: String,
  },
  consumerName: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: false,
    trim: true,
  },
});

let inbox = new Schema({
  Title: {
    type: String,
  },
  Content: {
    type: String,
  },
  Time: {
    type: String,
  },
});

let favProvider = new Schema({
  providerId: {
    type: String,
  },
  favStatus: {
    type: String,
  },
  Responded: {
    type: Boolean,
    default: false,
  },
});

let avoidProvider = new Schema({
  providerId: {
    type: String,
  },
});

// Forgot Pin

const ForgotPinViaPhone = new Schema({
  otp: {
    type: Number,
  },
  verified: {
    type: Boolean,
    select: false,
  },
});

const ForgotPinViaEmail = new Schema({
  otp: {
    type: Number,
  },
  verified: {
    type: Boolean,
    select: false,
  },
});

// Create Users
const User = new Schema(
  {
    email: {
      type: EmailValidator,
    },
    AdditionalEmail: { type: AdditionalEmail },

    // mobileNumber: {
    //     type: MobileNumberValidator
    // },
    AdditionalMobileNumber: { type: AdditionalMobileNumber },
    mobileNumber: { type: MobileNumberValidator },
    userType: {
      type: String, // home || business
      // required: true
    },
    providerType: {
      type: String,
    },
    dob: {
      type: String,
    },
    userNature: {
      type: String,
      enum: ["consumer", "provider"],
      required: true,
    },
    firstName: {
      type: String,
      // required: true,
    },
    lastName: {
      type: String,
      // required: true
    },
    BusinessName: { type: String },
    NatureOfBusiness: { type: String },
    GenderOfEmployees: { type: [String] },
    BusinessAddress: { type: String },
    password: {
      type: String,
      //  required: true
    },

    languagePreference: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      // required: true,
      enum: ["male", "female", "other"],
      // lowercase: true,
      trim: true,
    },
    status: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    OTP: { type: Number },
    optionalDetails: {
      type: OptionalDetails,
      required: false,
      trim: false,
    },
    OptionalDetailsForBusiness: {
      type: OptionalDetailsForBusiness,
      required: false,
      trim: false,
    },
    reviews: {
      type: [Review],
    },
    // optionals start ==========================
    document: {
      type: [Document],
    },
    documentApprovalStatus: {
      type: String,
      enum: ["notSubmitted", "pending", "approved", "rejected"],
    },
    verified: { type: Boolean },
    // optionals end  ===========================

    favouriteProviders: {
      type: [favProvider],
    },
    avoidList: {
      type: [avoidProvider],
    },
    addressesHome: {
      type: Address,
    },
    addressesBusiness: {
      type: Address,
    },
    addressesOther: {
      type: [AddressOther],
    },
    pincode: {
      type: String,
      // required: [true, "Pincode is required"],
      minLength: 8,
      select: false,
    },
    forgotPin: {
      mobileOtp: ForgotPinViaPhone,
      emailOtp: ForgotPinViaEmail,
      timeStmap: Date,
      select: false,
    },

    forgotPinViaSecurityQuestion: {
      verified: false,
      select: false,
    },
    categories: {
      type: [Category],
    },
    fcmToken: {
      type: String,
      required: false,
      trim: true,
    },
    sosContacts: {
      // reminder: {
      //   type: String,
      // },
      type: [Contact],
    },
    securityQuestions: {
      type: [SecurityQuestion],
    },

    bookingDetails: {
      type: [Booking],
    },
    Inbox: {
      type: [inbox],
    },
    complain: {
      type: [Complaints],
    },
    currentlocation: {
      type: [currentLocations],
    },
    pinenable: {
      type: Boolean,
      default: false,
    },
    referralCode: {
      type: String,
    },
    loginStatus: {
      type: String,
      enum: ["loggedIn", "loggedOut"],
    },
    rating: {
      type: Number,
      default: 4.6
    },
    noOfReviews: {
      type: Number,
      default: 0
    },
    favoriteCount: { type: Number, default: 0 },
    noOfServices: { type: Number, default: 0 },
    memberSince: { type: String, default: current_month_and_year_in_string() },
    CreatedAt: {
      type: String,
    },
    pinChangedAt: Date,
  },
  {
    collection: "users",
  }
);

// check for valid password
User.methods.correctPassword = async function (clientPassword, savedPassword) {
  return await bcrypt.compare(clientPassword, savedPassword);
};

// check valid token and password change
User.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.pinChangedAt) {
    const changedTimestamp = parseInt(this.pinChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

module.exports = mongoose.model("Users", User);
