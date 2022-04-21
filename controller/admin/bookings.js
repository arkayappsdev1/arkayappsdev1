const BookingCatagory = require("../../models/user/bookingCatagory");
const { catchErr } = require("../../error");

const bookingList = async (req, res) => {
  try {
    // const { status } = req.query;
    // if (
    //   status === "pending" ||
    //   status === "responded" ||
    //   status === "scheduled" ||
    //   status === "on the way" ||
    //   status === "in progress" ||
    //   status === "completed" ||
    //   status === "cancelled"
    // ) {
    const bookings = await BookingCatagory.find({}, {"ServiceDetails" : 1});

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      data: bookings,
    });
    // }

    // res.status(404).json({
    //   statusCode: 400,
    //   status: req.t("failure_status"),
    //   message: req.t("failure_message_5"),
    // });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const getBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

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

const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await BookingCatagory.findById(bookingId);

    if (!booking) {
      return res.status(400).json({
        statusCode: 400,
        status: req.t("failure_status"),
        message: req.t("failure_message_5"),
      });
    }

    await BookingCatagory.findByIdAndDelete(bookingId);

    res.status(200).json({
      statusCode: 200,
      status: req.t("success_status"),
      message: req.t("success_message_36"),
    });
  } catch (err) {
    res.status(500).json(catchErr(err, req));
  }
};

const paymentDetails = (req, res) => {
  res.send("working");
};

module.exports = { bookingList, getBooking, deleteBooking, paymentDetails };
