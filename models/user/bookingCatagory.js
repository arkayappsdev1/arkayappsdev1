const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Document = new Schema({
  taskImage: {
    type: String,
    // required: true
  },
  label: {
    type: String,
    // required: true
  },
});
let IP = new Schema({
  status: {
    type: String,
  },
  taskstatus: {
    type: String,
  },
});

let coordinates = new Schema({
  lat: { type: Number },
  long: { type: Number },
});

let AdditionalLaborMaterial = new Schema({
  labor: {
    type: [],
  },
  material: {
    type: [],
  },
  laborTotal: {
    type: Number,
  },
  materialTotal: {
    type: Number,
  },
  laborMaterialTotal: {
    type: Number,
  },
  comment: { type: String },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "approve", "decline"],
  },
});

let costDetails = new Schema({
  estimatedHours: {
    type: Number,
  },
  hourlyRate: {
    type: Number,
  },
  laborCost: {
    type: Number,
  },
  peakSurchargePercent: {
    type: Number,
  },
  peakSurchargeAmount: {
    type: Number,
  },
  nextHourDiscount: {
    type: Number,
  },
  nextHourDiscountAmount: {
    type: Number,
  },
  additionalDiscount: {
    type: Number,
  },
  additionalDiscountAmount: {
    type: Number,
  },
  rescaduleDiscount: {
    type: Number,
  },
  laborSubtotal: {
    type: Number,
  },
  otherCost: {
    type: Number,
  },
  additionalLabourMaterial: {
    type: AdditionalLaborMaterial,
  },
  totalCost: {
    type: Number,
  },
  ProviderId: {
    type: String,
  },
});
let Scheduledlist = new Schema({
  sche: {
    type: String,
  },
  otw: {
    type: String,
  },
  ip: IP,
  complete: { type: String },
});

let PaymentsMethod = new Schema({
  type: {
    type: String,
  },
  amount: {
    type: Number,
  },
  currency: {
    type: String,
  },
  status: {
    type: Number,
    enum: [0, 1, 2, 3], // 0 = Pending, 1 = completed, 2 = Cancelled, 3 = Failed
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});
let ReviewMethods = new Schema({
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

let ReqReshedule = new Schema({
  time: {
    type: Date,
  },
  reasonTitle: {
    type: String,
  },
  reasonDesc: {
    type: String,
  },
  rescheduleDiscount: {
    type: Number,
  },
  comment: {
    type: String,
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "approve", "decline"],
  },
});

let RequestMoreTime = new Schema({
  additionalTime: {
    type: String,
  },
  isFree: {
    type: Boolean,
  },
  additionalCost: {
    type: Number,
  },
  reason: {
    type: String,
  },
  description: {
    type: String,
  },
  comment: {
    type: String,
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "approve", "decline"],
  },
});
let cancelAtTask = new Schema({
  reason: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
});

let providerDetails = new Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  profilePic: {
    type: String,
  },
  gender: {
    type: String,
  },

  age: { type: Number },

  rating: { type: Number },

  noOfReviews: { type: Number },

  favoriteCount: { type: Number },

  cancellationPercent: { type: Number },

  noOfJobs: { type: Number },

  memberSince: { type: String },

  providerType: {
    type: String,
  },
  ProviderId: {
    type: String,
  },

  optionalDetails: { type: Object },

  isProcess: { type: Boolean },

  status: { type: String },

  ProviderStatus: { type: String },

  serviceHistory: { type: String },
});

let AcceptforProviderList = new Schema({
  Costdetails: {
    type: costDetails,
  },
  Providerdetails: { type: providerDetails },
  bookingStatus: {
    type: String,
  },
  ServicerequestId: {
    type: String,
  },
});

let CustomerSupport = new Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
});

let servicedetails = new Schema({
  Servicetime: {
    from: Date,
    to: Date,
  },
  ServiceType: {
    type: String,
    lowercase: true,
    trim: true,
  },
  Gender: { type: [] },
  Providertype: { type: [] },
  Responsewaittime: { type: [] },
  Estimatedtaskduration: { type: [] },
  ProviderResponseBy: {
    from: Date,
    to: Date,
  },
  taskDescription: { type: String },
  taskImages: [Document],
  subservice: {
    type: String,
  },
  SubserviceImage: {
    type: String,
  },
  serviceId: { type: String },
  subserviceId: {
    type: String,
  },
  bookingstatus: {
    type: String,
    required: true,
    lowercase: true,
    enum: [
      "pending",
      "responded",
      "scheduled",
      "on the way",
      "in progress",
      "completed",
      "cancelled",
      "paused"
    ],
  },
  bookedon: {
    type: String,
  },
  ServicerequestId: {
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
    enum: ["home", "business", "others"],
    required: true,
    lowercase: true,
  },
  servicePreference: {
    type: String,
    lowercase: true,
    trim: true,
  },

  coordinates: {
    type: coordinates,
  },
  address: {
    type: Object,
  },

  favouriteProviders: {
    type: [String],
  },
  localproviders: {
    type: [String],
  },
  providers: {
    type: [String],
  },
  helplaterproviders: {
    type: [String],
  },
  exactprovider: {
    type: [String],
  },

  OTP: {
    type: Number,
  },
  OTPVerify: {
    type: Boolean,
  },
  BasePrice: {
    type: String,
  },
  AveragePrice: {
    type: String,
  },
  // forCancelStatus : {
  //   type: String
  // },
  Peakhours: {
    type: String,
  },
  ScheduledStatus: {
    type: String,
  },
  Payment: {
    type: PaymentsMethod,
  },
  ServiceReviews: {
    type: ReviewMethods,
  },
  requestResheduling: {
    type: ReqReshedule,
  },
  requestMoreTime: {
    type: RequestMoreTime,
  },
  requestMoreLaborMaterial: {
    type: AdditionalLaborMaterial,
  },
  customerSupport: {
    type: CustomerSupport,
  },
  uploadTaskComplete: {
    type: [Document],
  },
  cancelState: {
    type: String,
  },
  cancelTask: {
    type: cancelAtTask,
  },

  ScheduledStatusList: {
    type: Scheduledlist,
  },
});

let Providerdetails = new Schema({
  ProviderDetails: {
    type: providerDetails,
  },

  costDetails: {
    type: costDetails,
  },
  forCancelStatus: {
    type: String,
  },
  ProviderStatus: {
    type: String,
  },
});

let coworkerDetails = new Schema({
  coworkerID: { type: String },
  providerId: { type: String },
  costDetails: {
    type: costDetails,
  },
});

let Bookingcatagory = new Schema(
  {
    UserID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    ServiceDetails: {
      type: servicedetails,
    },
    acceptedProviderDetails: {
      type: AcceptforProviderList,
    },
    ProviderDetails: {
      type: [Providerdetails],
    },
    CoworkerDetails: {
      type: coworkerDetails,
    },
  },
  {
    collection: "BookingCatagories",
  }
);

module.exports = mongoose.model("Bookingcatagory", Bookingcatagory);
