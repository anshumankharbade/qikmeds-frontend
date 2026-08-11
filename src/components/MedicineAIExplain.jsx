import { useState, useEffect } from "react";
import api from "../services/api";

// Modal that lazily fetches an AI-generated, bullet-point explanation for a
// single medicine and renders it. Fetch is triggered by mounting this
// component (MedicineCard only renders it once the user asks to see it),
// so no API call happens until someone actually opens it.
const MedicineAIExplain = ({ medicineId, medicineName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [points, setPoints] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchExplanation = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/medicines/${medicineId}/explain`);
        if (!cancelled) setPoints(data.points || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Couldn't load an explanation right now.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchExplanation();
    return () => {
      cancelled = true;
    };
  }, [medicineId]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span aria-hidden="true">✨</span> About {medicineName}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-1"
          >
            &times;
          </button>
        </div>

        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 text-gray-500 py-8">
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Thinking...
            </div>
          )}

          {!loading && error && (
            <p className="text-red-600 text-sm py-4">{error}</p>
          )}

          {!loading && !error && (
            <>
              <ul className="space-y-2.5 text-sm text-gray-700">
                {points.map((point, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
                AI-generated summary — not a substitute for advice from your
                pharmacist or doctor.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineAIExplain;
