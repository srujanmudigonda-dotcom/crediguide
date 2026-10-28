const { ensureScoreProfile } = require("../utils/scoreProfile");

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

    // Self-heal: profiles are created at registration, but accounts
    // registered earlier may not have one yet - create it on the spot
    // from the CIBIL score stored on the user.
    const simulator = await ensureScoreProfile(userId);

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