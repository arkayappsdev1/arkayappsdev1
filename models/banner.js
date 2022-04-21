const mogoose = require('mongoose')

const BannerSchema = new mogoose.Schema({
    imagePath: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [1, 0]
    },
    page: {
        type: [String],
        enum: ["Home", "Sub-service"],
        trim: true,
    },
    userType: {
        type: [String],
        enum: ["home", "business", "industrial"],
        trim: true,
    },
    userNature: {
        type: [String],
        enum: ["Consumer", "Provider"],
        trim: true,
    },
    // appType: {
    //     type: [String],
    //     enum: ["Consumer", "Provider"],
    //     trim: true,
    // },
    country: {
        type: String,
    },
    countryCode: {
        type: String,
    },
    ownerName: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    startDate: {
        type: Date,
    },
    expireDate: {
        type: Date
    },
    redirectUrl: {
        type: String,
        trim: true,
    }
});

const Banners = mogoose.model("Banners", BannerSchema)

module.exports = Banners