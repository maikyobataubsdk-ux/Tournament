import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { FileCheck, Plus, CheckCircle, Trophy } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function AdminResults() {
  const [results, setResults] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedTourney, setSelectedTourney] = useState("");
  const [matchId, setMatchId] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [position, setPosition] = useState(1);
  const [eliminations, setEliminations] = useState(5);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [resData, tourneys] = await Promise.all([
        fetchAPI("/results"),
        fetchAPI("/tournaments"),
      ]);
      setResults(resData || []);
      setTournaments(tourneys || []);
      if (tourneys && tourneys.length > 0) {
        setSelectedTourney(tourneys[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchAPI("/results/submit", {
        method: "POST",
        body: JSON.stringify({
          tournament_id: selectedTourney,
          match_id: matchId,
          results: [
            {
              participant_id: participantId,
              participant_name: participantName,
              position: Number(position),
              eliminations: Number(eliminations),
            },
          ],
        }),
      });
      alert("Scores verified, approved, and leaderboards recalculated!");
      setShowSubmit(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to submit scores");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Match Results & Scoring Referee Desk">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Verify referee screenshots, assign placement and kill points, and commit verified results to the global leaderboards.
          </p>
          <button
            onClick={() => setShowSubmit(!showSubmit)}
            className="flex items-center gap-2 bg-[#ff5500] hover:bg-[#ff661a] text-white px-4 py-2 rounded-xl text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Submit / Verify Scores</span>
          </button>
        </div>

        {showSubmit && (
          <div className="bg-[#0e131f] border border-[#ff5500]/40 p-6 rounded-2xl mb-6 max-w-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Enter Match Results</h3>
            <form onSubmit={handleSubmitScore} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-medium">Tournament</label>
                <select
                  value={selectedTourney}
                  onChange={(e) => setSelectedTourney(e.target.value)}
                  className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-medium">Match ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mtch_01"
                  value={matchId}
                  onChange={(e) => setMatchId(e.target.value)}
                  className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-medium">Participant ID</label>
                  <input
                    type="text"
                    required
                    placeholder="User ID or Team ID"
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                    className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-medium">Participant Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BooyahKing"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-medium">Finish Position</label>
                  <input
                    type="number"
                    min={1}
                    max={48}
                    value={position}
                    onChange={(e) => setPosition(Number(e.target.value))}
                    className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-medium">Eliminations (Kills)</label>
                  <input
                    type="number"
                    min={0}
                    value={eliminations}
                    onChange={(e) => setEliminations(Number(e.target.value))}
                    className="w-full bg-[#121826] border border-[#1a2333] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmit(false)}
                  className="px-4 py-2 rounded-xl bg-[#121826] text-gray-400 border border-[#1a2333]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#ff5500] hover:bg-[#ff661a] font-bold text-white transition disabled:opacity-50"
                >
                  {loading ? "Recording..." : "Approve & Record Score"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-[#0e131f] border border-[#1a2333] rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121826] text-gray-400 uppercase font-semibold border-b border-[#1a2333]">
              <tr>
                <th className="py-4 px-6">Match ID</th>
                <th className="py-4 px-6">Participant</th>
                <th className="py-4 px-6">Placement</th>
                <th className="py-4 px-6">Kills</th>
                <th className="py-4 px-6 text-right">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2333]">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-[#161d2d] transition">
                  <td className="py-4 px-6 font-mono text-gray-400">{r.match_id}</td>
                  <td className="py-4 px-6 font-bold text-white">{r.participant_name}</td>
                  <td className="py-4 px-6 text-yellow-400 font-bold">#{r.position} Finish ({r.placement_points} pts)</td>
                  <td className="py-4 px-6 text-red-400 font-bold">{r.eliminations} Kills ({r.elimination_points} pts)</td>
                  <td className="py-4 px-6 text-right font-black text-sm text-[#ff5500]">{r.total_points} PTS</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
