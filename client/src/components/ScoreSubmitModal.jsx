import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { submitScore } from '../services/gameService';
import { useAuth } from '../context/AuthContext';

export default function ScoreSubmitModal({
  isOpen,
  score,
  gameId,
  gameTitle,
  onClose,
  onRestart,
}) {
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!isAuthenticated) return;
    setIsSubmitting(true);
    setError('');
    try {
      await submitScore(gameId, score);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit score');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-14 h-14 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full mx-auto flex items-center justify-center">
          <Trophy className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white tracking-wide">GAME OVER</h2>
          <p className="text-xs text-slate-400 mt-1">{gameTitle}</p>
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Final Score</span>
            <div className="text-4xl font-extrabold text-emerald-400 mt-1">{score.toLocaleString()}</div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Score posted to the leaderboard!</span>
          </div>
        ) : (
          isAuthenticated ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Score...</span>
                </>
              ) : (
                <span>Submit to Leaderboard</span>
              )}
            </button>
          ) : (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-xs">
              <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
                Sign in
              </Link>{' '}
              to save and submit your high score to the leaderboard.
            </div>
          )
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              setIsSubmitted(false);
              onRestart();
            }}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition"
          >
            Play Again
          </button>
          <Link
            to={`/games/${gameId}/leaderboard`}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium text-xs border border-slate-700 transition flex items-center justify-center"
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
