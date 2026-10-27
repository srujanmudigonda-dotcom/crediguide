
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import RepaymentAdvisorCard from "../components/RepaymentAdvisor";

function RepaymentAdvisor() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Repayment Advisor
              </h2>

              <p className="mt-2 text-gray-500">
                Get personalized repayment guidance based on your loans,
                payment behavior and simulated credit score.
              </p>
            </div>

            <RepaymentAdvisorCard />

          </div>
        </main>
      </div>
    </div>
  );
}

export default RepaymentAdvisor;
