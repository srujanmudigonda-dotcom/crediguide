import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CreditScore from "../components/CreditScore";
import CreditHealth from "../components/CreditHealth";
import ScoreHistory from "../components/ScoreHistory";
import { getCreditScore, getScoreHistory } from "../services/creditService";
import {
  TrendingUp,
  CalendarDays,
  ShieldCheck,
  Info,
} from "lucide-react";

function CreditScorePage() {
  const [scoreData, setScoreData] = useState(null);
  const [change, setChange] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const scoreResponse = await getCreditScore();
        if (scoreResponse.success) {
          setScoreData(scoreResponse);
        }

        const historyResponse = await getScoreHistory();
        const history = historyResponse.history || [];
        if (history.length > 1) {
          setChange(history[history.length - 1].score - history[0].score);
        }
      } catch (error) {
        console.error("Credit Score Page Error:", error);
      }
    };

    load();
  }, []);

  const changeText =
    change === null ? "—" : `${change >= 0 ? "+" : ""}${change} points`;

  const lastUpdatedText = scoreData?.lastUpdated
    ? new Date(scoreData.lastUpdated).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-slate-100">

      <Navbar />

      <div className="flex">

        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-7xl">

            {/* Page Header */}
            <div className="mb-8">

              <h2 className="text-3xl font-bold text-gray-800">
                Credit Score
              </h2>

              <p className="mt-2 text-gray-500">
                Understand your credit score and the factors that influence
                your credit health.
              </p>

            </div>

            {/* Score Overview */}
            <div className="grid gap-6 lg:grid-cols-2">

              {/* Credit Score Gauge */}
              <CreditScore />

              {/* Score Summary */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Score Overview
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      Your current credit score status
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
                    <ShieldCheck
                      size={22}
                      className="text-green-600"
                    />
                  </div>

                </div>

                {/* Score */}
                <div className="mt-8 flex items-center justify-between">

                  <div>

                    <p className="text-sm text-gray-500">
                      Current Score
                    </p>

                    <p className="mt-1 text-5xl font-bold text-gray-800">
                      {scoreData ? scoreData.score : "—"}
                    </p>

                  </div>

                  <div className="text-right">

                    <span className="inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-600">
                      {scoreData ? scoreData.status : "—"}
                    </span>

                    <p className="mt-2 text-xs text-gray-400">
                      Range: 300 - 900
                    </p>

                  </div>

                </div>

                {/* Score Change */}
                <div className="mt-8 rounded-xl bg-green-50 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <TrendingUp
                        size={20}
                        className="text-green-600"
                      />
                    </div>

                    <div>

                      <p className="text-sm font-medium text-gray-600">
                        Score Change
                      </p>

                      <p className="mt-1 text-lg font-bold text-green-600">
                        {changeText}
                      </p>

                    </div>

                  </div>

                  <p className="mt-3 text-xs leading-5 text-gray-500">
                    Your score has increased compared with the beginning
                    of the displayed score history.
                  </p>

                </div>

                {/* Last Updated */}
                <div className="mt-5 flex items-center gap-3 rounded-xl bg-gray-50 p-4">

                  <CalendarDays
                    size={20}
                    className="text-blue-600"
                  />

                  <div>

                    <p className="text-sm font-medium text-gray-700">
                      Last Updated
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {lastUpdatedText}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* Credit Health */}
            <div className="mt-6">

              <CreditHealth />

            </div>

            {/* Credit Health Explanation */}
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Info
                    size={20}
                    className="text-blue-600"
                  />
                </div>

                <div>

                  <h3 className="text-lg font-semibold text-gray-700">
                    What Influences Your Credit Score?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Your credit score is influenced by factors such as
                    payment behavior, credit utilization, age of credit
                    accounts, and your overall credit account profile.
                  </p>

                </div>

              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* Payment History */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                  <h4 className="font-semibold text-gray-700">
                    Payment History
                  </h4>

                  <p className="mt-2 text-sm leading-5 text-gray-500">
                    Paying credit obligations on time helps maintain
                    a healthy payment history.
                  </p>

                </div>

                {/* Credit Utilization */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                  <h4 className="font-semibold text-gray-700">
                    Credit Utilization
                  </h4>

                  <p className="mt-2 text-sm leading-5 text-gray-500">
                    Managing outstanding balances relative to available
                    credit can support healthier credit usage.
                  </p>

                </div>

                {/* Credit Age */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                  <h4 className="font-semibold text-gray-700">
                    Credit Age
                  </h4>

                  <p className="mt-2 text-sm leading-5 text-gray-500">
                    The length of your credit history can contribute to
                    your overall credit profile.
                  </p>

                </div>

                {/* Credit Accounts */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                  <h4 className="font-semibold text-gray-700">
                    Credit Accounts
                  </h4>

                  <p className="mt-2 text-sm leading-5 text-gray-500">
                    The types and number of credit accounts form part of
                    your overall credit information.
                  </p>

                </div>

              </div>

            </div>

            {/* Score History */}
            <div className="mt-6">

              <ScoreHistory />

            </div>

            {/* Score Checking Information */}
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <ShieldCheck
                    size={20}
                    className="text-blue-600"
                  />
                </div>

                <div>

                  <h3 className="font-semibold text-blue-800">
                    Checking Your Credit Score
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-blue-700">
                    Viewing your own credit information through a
                    consumer-facing service generally does not itself
                    create a hard inquiry. CrediGuide is designed to
                    separate score viewing from credit applications.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default CreditScorePage;