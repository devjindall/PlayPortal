import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGameById } from '../services/gameService';
import LoadingSpinner from '../components/LoadingSpinner';
import ScoreSubmitModal from '../components/ScoreSubmitModal';
import { ArrowLeft, Maximize2, Minimize2, RotateCcw, Trophy, Shield } from 'lucide-react';

export default function GamePlayPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameOverScore, setGameOverScore] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  const backendBaseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      try {
        const data = await getGameById(id);
        setGame(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Unable to load game');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  // Listen for score event from iframe game
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'PLAYPORTAL_GAME_OVER') {
        const rawScore = Number(event.data.score);
        if (!isNaN(rawScore) && rawScore >= 0) {
          setGameOverScore(rawScore);
          setModalOpen(true);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRestart = () => {
    setModalOpen(false);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src; // Reload iframe
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn('Error enabling fullscreen:', err.message);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Error exiting fullscreen:', err.message);
      });
      setIsFullscreen(false);
    }
  };

  if (loading) return <LoadingSpinner text="Initializing game player..." />;

  if (error || !game) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 bg-slate-900 border border-slate-800 p-8 rounded-2xl">
        <h2 className="text-xl font-bold text-white">Error Loading Game</h2>
        <p className="text-xs text-slate-400">{error || 'Game could not be loaded.'}</p>
        <Link
          to="/games"
          className="inline-block px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const playableUrl = game.gameUrl?.startsWith('http')
    ? game.gameUrl
    : `${backendBaseUrl}${game.gameUrl}`;

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <Link
            to={`/games/${game._id}`}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Back to Game Details"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">{game.title}</h1>
            <span className="text-[10px] text-emerald-400 font-semibold">{game.category}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {game.supportsScores && (
            <Link
              to={`/games/${game._id}/leaderboard`}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-400 text-xs font-semibold flex items-center space-x-1.5 transition"
              title="Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>
          )}

          <button
            onClick={handleRestart}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Reload Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Game Iframe Container */}
      <div
        ref={containerRef}
        className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center"
      >
        <iframe
          ref={iframeRef}
          src={playableUrl}
          title={game.title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          allow="autoplay; fullscreen"
        />
      </div>

      {/* Security & Sandbox Info Note */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
        <div className="flex items-center space-x-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          <span>Running in an isolated HTML5 sandbox environment.</span>
        </div>
        <span>PlayPortal Web Player</span>
      </div>

      {/* Score Submission Modal */}
      <ScoreSubmitModal
        isOpen={modalOpen}
        score={gameOverScore || 0}
        gameId={game._id}
        gameTitle={game.title}
        onClose={() => setModalOpen(false)}
        onRestart={handleRestart}
      />
    </div>
  );
}
