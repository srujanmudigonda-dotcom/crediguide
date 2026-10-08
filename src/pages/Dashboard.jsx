import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CreditScore from "../components/CreditScore";
import CreditHealth from "../components/CreditHealth";
import ScoreHistory from "../components/ScoreHistory";
import PaymentCard from "../components/PaymentCard";
import EMICard from "../components/EMICard";
import ImprovementPlanCard from "../components/ImprovementPlanCard";

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100">

      <Navbar />

      <div className="flex">

        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-7xl">

            {/* Dashboard Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Credit Dashboard
              </h2>

              <p className="mt-2 text-gray-500">
                Monitor your credit score, payments and credit health.
              </p>
            </div>

            {/* Score and Health */}
            <div className="grid gap-6 lg:grid-cols-2">

              <CreditScore />

              <CreditHealth />

            </div>

            {/* Score History */}
            <div className="mt-6">

              <ScoreHistory />

            </div>

            {/* Payments */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">

              <PaymentCard />

              <EMICard />

            </div>

            {/* Improvement Plan */}
            <div className="mt-6">

              <ImprovementPlanCard />

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;