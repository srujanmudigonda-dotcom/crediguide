const CibilSimulator = require("../models/CibilSimulator");

/*
|--------------------------------------------------------------------------
| Get Simulated Credit Score
|--------------------------------------------------------------------------
|
| Returns the user's educational simulated score and score history.
| This is NOT an official TransUnion CIBIL score.
|
*/

const getCibilSimulator = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const simulator = await CibilSimulator.findOne({
      user: userId,
    });

    if (!simulator) {
      return res.status(404).json({
        success: false,
        message:
          "Your simulated credit score has not been created yet.",
      });
    }

    return res.json({
      success: true,
      simulator,
    });
  } catch (error) {
    console.error(
      "Get Simulated Credit Score Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load your simulated credit score.",
    });
  }
};

module.exports = {
  getCibilSimulator,
};