const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let DefaultLimits = new Schema({
  minimum: {
    type: Number,
    required: true,
    trim: true,
  },
  maximum: {
    type: Number,
    required: true,
    trim: true,
  },
  jumpValue: {
    type: Number,
    required: true,
    trim: true,
  },
});

let RegionObject = new Schema({
  regionId: {
    type: String,
    required: true,
    trim: true,
  },
  regionName: {
    type: String,
    required: true,
    trim: true,
  },
  regionType: {
    type: String,
    required: true,
    trim: true,
  },
});

let Region = new Schema({
  region: {
    type: RegionObject,
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
    trim: true,
  },
  averageTaskTime: {
    type: Number, // Time taken for completion
    required: true,
    trim: true,
  },
  estimatedTaskDuration: {
    type: DefaultLimits,
    required: true,
  },
  resposeWaitTime: {
    type: DefaultLimits,
    required: true,
  },
  nextHourDiscount: {
    type: DefaultLimits,
    required: true,
  },
  peakHourCharges: {
    type: DefaultLimits,
    required: true,
  },
});

let SubServiceDefaults = new Schema({
  basePrice: {
    type: Number,
    required: true,
    trim: true,
  },
  averageTaskTime: {
    type: Number, // Time taken for completion
    required: true,
    trim: true,
  },
  nextHourDiscount: {
    type: DefaultLimits,
    required: true,
  },
  peakHourCharges: {
    type: DefaultLimits,
    required: true,
  },
});

const timeScheme = {
  peakhourset: {
    type: String,
    required: false,
    trim: true,
  },
  // peakhoursto : {
  //     type : String,
  //     required : false,
  //     trim : true
  // }
};

let SubService = new Schema(
  {
    serviceid: { type: String },
    name: {
      type: String,
      unique: false,
      required: true,
      sparse: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String
    },
    type: {
      type: [String],
      enum: ["Home", "Business", "Individual"],
      required: true,
      trim: true,
    },
    status: {
      type: Number,
      // required: true,
      trim: true,
    },
    ServicePrice: {
      minimum: Number,
      maximum: Number,
    },
    BasePrice: {
      type: Number,
    },
    averageTaskTime: {
      type: String,
    },
    responseWaitTime: {
      Defvalue: String,
      maxvalue: Number,
      jumpvalue: Number,
      default: {},
    },
    Estimatedtime: {
      Defvalue: String,
      estimatedvalue: Number,
      jumpvalue: Number,
      default: {},
    },
    serviceRadius: {
      type: Number,
    },
    peakhours: {
      type: String,
    },
    peakHourSurchargePercent: {
      type: Number,
    },
    nextHourDiscountPercent: {
      type: Number
    }
  },
  {
    collection: "services",
  }
);

// Define collection and schema
let serviceSchema = new Schema(
  {
    name: {
      type: String,
      // required: true,
      unique: false,
      trim: true,
    },
    type: {
      type: [String],
      enum: ["Home", "Business", "Individual"],
      required: true,
      trim: true,
    },
    vicinity: {
      type: [String],
      required: true,
      enum: ["In-person", "Remote"],
      // trim: true,
    },
    imageUrl: {
      type: String,
    },
    subServices: {
      type: [SubService],
      required: false,
    },
    status: {
      type: Number,
      // required: true,
      trim: true,
    },
    location: {
      type: String,
    },
    place_id: {
      type: String,
    },
    coords: {
      latitude: Number,
      longitude: Number,
      default: {},
    },
    country: {
      type: String,
      required: true,
    },
    docRequirement: {
      type : Boolean
    },
    documentList: {
      type: [Object]
    }
  },
  {
    collection: "services",
  }
);

const Services = mongoose.model("Services", serviceSchema);

module.exports = Services;