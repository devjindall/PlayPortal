import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { uploadGame } from '../services/developerService';
import {
  Upload,
  ArrowLeft,
  FileArchive,
  Image,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'Action',
  'Arcade',
  'Puzzle',
  'Strategy',
  'Sports',
  'Casual',
  'Retro',
  'Card',
];

export default function UploadGamePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Arcade');
  const [supportsScores, setSupportsScores] = useState(true);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [zipFile, setZipFile] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleZipChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setError('Game file must be a .ZIP archive');
        return;
      }
      setZipFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) {
      setError('Please fill in all required text fields');
      return;
    }

    if (!zipFile) {
      setError('Please select a game .ZIP archive');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('supportsScores', supportsScores);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      formData.append('gameFile', zipFile);

      await uploadGame(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/developer');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Game upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Back link */}
      <Link
        to="/developer"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-purple-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Developer Dashboard</span>
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Upload className="w-7 h-7 text-purple-400" />
          <span>Upload HTML5 Game</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Submit your HTML5 game package for administrative review and publication
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <div>
              <div className="font-bold">Game Uploaded Successfully!</div>
              <div>Your game is now in the admin review queue. Redirecting to dashboard...</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Game Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Galaxy Raider"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description & Gameplay Instructions *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your game, controls, and scoring mechanics..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Category & Supports Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 transition cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3 pt-6">
              <input
                type="checkbox"
                id="supportsScores"
                checked={supportsScores}
                onChange={(e) => setSupportsScores(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 bg-slate-950 border-slate-800 focus:ring-purple-500"
              />
              <label htmlFor="supportsScores" className="text-xs text-slate-300 font-medium cursor-pointer">
                Enable Game-Specific High Score Leaderboards
              </label>
            </div>
          </div>

          {/* File Uploads Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Game Thumbnail Image
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 text-center space-y-3 bg-slate-950/50 transition">
                {thumbnailPreview ? (
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-slate-800">
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="py-4">
                    <Image className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">PNG, JPG, WEBP, or SVG</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-purple-300 hover:file:bg-slate-700"
                />
              </div>
            </div>

            {/* ZIP Package Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                HTML5 Game ZIP Archive *
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 text-center space-y-3 bg-slate-950/50 transition">
                <div className="py-4">
                  <FileArchive className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  {zipFile ? (
                    <div>
                      <p className="text-xs font-bold text-white truncate">{zipFile.name}</p>
                      <p className="text-[10px] text-slate-400">{(zipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-300 font-medium">ZIP Archive only</p>
                      <p className="text-[10px] text-slate-500">Must include index.html (Max 25MB)</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  required
                  accept=".zip,application/zip"
                  onChange={handleZipChange}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-950 file:text-purple-300 hover:file:bg-purple-900"
                />
              </div>
            </div>
          </div>

          {/* Submission Guidelines Note */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 text-purple-300 text-xs space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Developer Guidelines</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-0.5 list-disc list-inside">
              <li>ZIP archive must contain an <code>index.html</code> entry file.</li>
              <li>Games run in sandboxed iframes. To post scores, dispatch <code>window.parent.postMessage({'{'} type: 'PLAYPORTAL_GAME_OVER', score: number {'}'}, '*')</code>.</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-950/50 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isUploading ? (
              <span>Uploading & Validating Archive...</span>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Submit Game Package</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
