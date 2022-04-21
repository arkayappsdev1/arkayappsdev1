const catchErr = (err, req) => {
  console.log(err)
  if (err.message?.includes("E11000 duplicate key error collection")) {
    return {
      status: req.t("exist_status"),
      message: err.message,
    };
  }
  return {
    status: req.t("error_status"),
    message: err.message,
  };
};

module.exports = { catchErr };
