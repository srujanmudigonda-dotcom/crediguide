import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ScoreHistory from "../components/ScoreHistory";

function ScoreHistoryPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                Score History
              </h1>

              <p className="mt-2 text-gray-500">
                Track how your simulated credit score changes based on
                your recorded payment behavior.
              </p>
            </div>

            <ScoreHistory />
          </div>
        </main>
      </div>
    </div>
  );
}

export default ScoreHistoryPage;