'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '@/lib/tmdb';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, X, Hash, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, Gauge, MonitorPlay, Users } from 'lucide-react';
import ConstellationUI from '@/components/ConstellationUI';
import { useState, useRef, useEffect } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function MovieDiorama({ movie }: { movie: Movie }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDioramaActive, setIsDioramaActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(true);
  const [played, setPlayed] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [screenMode, setScreenMode] = useState<'fill' | 'fit' | 'anamorphic'>('fill');
  const [syncToast, setSyncToast] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });
  
  
  const ytRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLocalFile = movie.trailerKey?.includes('/uploads/') || movie.trailerKey?.endsWith('.mp4') || movie.trailerKey?.endsWith('.webm');

  useEffect(() => {
    setIsMounted(true);
    
    if (isLocalFile) {
      setIsPlayerReady(true); // Native HTML5 is synchronous enough
      return;
    }

    // Initialize Native YouTube API for external URLs
    if (typeof window !== 'undefined') {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const initPlayer = () => {
        if (!movie.trailerKey) return;
        let videoId = movie.trailerKey;
        if (movie.trailerKey.includes('youtu')) {
          const match = movie.trailerKey.match(/(?:v=|\/embed\/|\.be\/)([^&?]+)/);
          if (match && match[1]) {
            videoId = match[1];
          }
        }

        ytRef.current = new window.YT.Player('native-yt-player', {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            mute: 1
          },
          events: {
            onReady: (e: any) => setIsPlayerReady(true),
            onStateChange: (e: any) => {
               if (e.data === 1) setPlaying(true);
               if (e.data === 2) setPlaying(false);
               if (e.data === 0) setPlaying(false); // Ended
            }
          }
        });
      };

      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        window.onYouTubeIframeAPIReady = initPlayer;
      }
    }

    return () => {
      if (ytRef.current && typeof ytRef.current.destroy === 'function') {
        try { ytRef.current.destroy(); } catch (e) {} // Silently destroy to prevent AbortErrors
      }
      setPlaying(false);
    };
  }, [movie.trailerKey]);

  // Handle Playback Progress manually via intervals
  useEffect(() => {
    if (isLocalFile) return; // Native video handles its own timeUpdate events

    let interval: any;
    if (playing && ytRef.current?.getCurrentTime && ytRef.current?.getDuration) {
      interval = setInterval(() => {
        const current = ytRef.current.getCurrentTime();
        const duration = ytRef.current.getDuration();
        if (duration > 0) {
           setPlayed(current / duration);
           if (current > 5 && current < 25) setShowSkipIntro(true);
           else setShowSkipIntro(false);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [playing]);

  // Mock Sync Engine
  useEffect(() => {
    if (!isDioramaActive) return;
    
    // Simulate someone pausing the stream after 45-60 seconds if it's playing
    const syncTimer = setTimeout(() => {
      if (playing) {
        if (isLocalFile) videoRef.current?.pause();
        else ytRef.current?.pauseVideo?.();
        setPlaying(false);
        setSyncToast({ message: "Karthik paused the stream to get popcorn.", visible: true });
        
        setTimeout(() => setSyncToast({ message: '', visible: false }), 4000);
      }
    }, Math.floor(Math.random() * 30000) + 45000);

    return () => clearTimeout(syncTimer);
  }, [isDioramaActive, playing]);

  const toggleDiorama = () => {
    setIsDioramaActive(!isDioramaActive);
    if (!isDioramaActive) {
      isLocalFile ? videoRef.current?.play() : ytRef.current?.playVideo?.();
      setPlaying(true);
    } else {
      isLocalFile ? videoRef.current?.pause() : ytRef.current?.pauseVideo?.();
      setPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (playing) {
      isLocalFile ? videoRef.current?.pause() : ytRef.current?.pauseVideo?.();
      setPlaying(false);
    } else {
      isLocalFile ? videoRef.current?.play() : ytRef.current?.playVideo?.();
      setPlaying(true);
    }
  };

  const toggleMute = () => {
    if (muted) { 
      if (isLocalFile && videoRef.current) videoRef.current.muted = false;
      else ytRef.current?.unMute?.(); 
      setMuted(false); 
    } else { 
      if (isLocalFile && videoRef.current) videoRef.current.muted = true;
      else ytRef.current?.mute?.(); 
      setMuted(true); 
    }
  };

  const handleSeekChange = (e: any) => {
    const newPlayed = parseFloat(e.target.value);
    setPlayed(newPlayed);
    if (isLocalFile && videoRef.current) {
       videoRef.current.currentTime = newPlayed * videoRef.current.duration;
    } else if (ytRef.current?.getDuration) {
      ytRef.current.seekTo?.(newPlayed * ytRef.current.getDuration(), true);
    }
  };

  const skipTime = (amount: number) => {
    if (isLocalFile && videoRef.current) {
       videoRef.current.currentTime += amount;
    } else if (ytRef.current?.getCurrentTime) {
      ytRef.current.seekTo?.(ytRef.current.getCurrentTime() + amount, true);
    }
  };

  const togglePlaybackRate = () => {
    const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (isLocalFile && videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    } else {
      ytRef.current?.setPlaybackRate?.(nextRate);
    }
  };

  const handleSkipIntro = () => {
    if (isLocalFile && videoRef.current) {
       videoRef.current.currentTime = 90;
    } else {
      ytRef.current?.seekTo?.(90, true);
    }
    setShowSkipIntro(false);
  };

  const handleVolumeChange = (e: any) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (vol > 0) {
      setMuted(false);
      if (isLocalFile && videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = vol;
      } else {
        ytRef.current?.unMute?.();
        ytRef.current?.setVolume?.(vol * 100);
      }
    } else {
      setMuted(true);
      if (isLocalFile && videoRef.current) videoRef.current.muted = true;
      else ytRef.current?.mute?.();
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch((err) => console.log(err));
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const toggleScreenMode = () => {
    if (screenMode === 'fill') setScreenMode('fit');
    else if (screenMode === 'fit') setScreenMode('anamorphic');
    else setScreenMode('fill');
  };

  const getScreenClasses = () => {
    if (screenMode === 'fill') return 'w-[140vw] h-[140vh] md:w-[120vw] md:h-[120vh] object-cover';
    if (screenMode === 'fit') return 'w-[100vw] h-[100vh] object-contain';
    if (screenMode === 'anamorphic') return 'w-[100vw] h-[100vh] scale-x-125 scale-y-[0.85] object-fill';
    return '';
  };

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-void-deep text-foreground">
      
      {/* Background Poster (The deepest layer) - Fades out when video plays */}
      <AnimatePresence>
        {!isDioramaActive && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layoutId={`movie-poster-${movie.id}`}
            className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
            style={{ backgroundImage: `url(${movie.backdrop})` }}
          />
        )}
      </AnimatePresence>
      
      {/* Cinematic Video Player powered by Native Youtube API */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isDioramaActive ? 1 : 0 }}
        transition={{ duration: 1 }}
        className={`absolute inset-0 z-0 bg-black overflow-hidden flex items-center justify-center`}
      >
        {isMounted && (
          movie.trailerKey ? (
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out ${getScreenClasses()}`}>
              {isLocalFile ? (
                <video 
                  ref={videoRef}
                  src={movie.trailerKey}
                  className="w-full h-full pointer-events-none"
                  playsInline
                  onTimeUpdate={(e: any) => {
                    const current = e.target.currentTime;
                    const duration = e.target.duration;
                    if (duration > 0) setPlayed(current / duration);
                    if (current > 5 && current < 25) setShowSkipIntro(true);
                    else setShowSkipIntro(false);
                  }}
                  onEnded={() => setPlaying(false)}
                />
              ) : (
                <div id="native-yt-player" className="w-full h-full pointer-events-none" />
              )}
            </div>
          ) : (
            // Search Backup iframe if no specific URL is provided
            <iframe 
              src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(movie.title + ' malayalam full movie')}&autoplay=1&controls=0&modestbranding=1&rel=0`}
              allow="autoplay; encrypted-media; fullscreen"
              className={`pointer-events-none transition-all duration-700 ease-in-out ${getScreenClasses()}`}
            />
          )
        )}
      </motion.div>

      {/* Heavy vignette for focus - Hides when video plays */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isDioramaActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-black" />
      </div>

      {/* Navigation - Fades out upward when video plays */}
      <motion.div 
        animate={{ opacity: isDioramaActive ? 0 : 1, y: isDioramaActive ? -50 : 0 }}
        transition={{ duration: 0.5 }}
        className={`absolute top-4 left-4 md:top-8 md:left-8 z-[70] ${isDioramaActive ? 'pointer-events-none' : 'pointer-events-auto'}`}
      >
        <Link href="/">
          <div className="flex items-center gap-2 text-white/50 hover:text-neon-cyan transition-colors bg-black/40 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass-panel cursor-pointer">
            <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="text-[10px] md:text-sm uppercase tracking-widest font-bold">Return to Orbit</span>
          </div>
        </Link>
      </motion.div>

      {/* Main Diorama Content (Title, Info, Cast) - Fades out entirely when video plays */}
      <motion.div 
        animate={{ opacity: isDioramaActive ? 0 : 1, filter: isDioramaActive ? 'blur(10px)' : 'blur(0px)' }}
        transition={{ duration: 0.8 }}
        className={`relative z-10 container mx-auto px-8 h-screen flex flex-col justify-center ${isDioramaActive ? 'pointer-events-none' : 'pointer-events-auto'}`}
        style={{ perspective: '1000px' }}
      >
        
        {/* Title & Metadata Layer */}
        <motion.div 
          initial={{ opacity: 0, z: -100, rotateX: 10 }}
          animate={{ opacity: 1, z: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-3xl transform-style-3d will-change-transform"
        >
          <motion.div layoutId={`movie-title-${movie.id}`}>
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] mb-4 leading-none">
              {movie.title}
            </h1>
          </motion.div>

          <div className="flex flex-wrap items-center gap-4 text-neon-cyan/80 text-sm font-semibold tracking-widest uppercase mb-8">
            <span className="px-4 py-1.5 glass-panel rounded-md border border-neon-cyan/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]">{movie.year}</span>
            <span className="text-white/30">•</span>
            <span className="px-4 py-1.5 glass-panel rounded-md border border-neon-cyan/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]">{movie.language === 'ml' ? 'Malayalam' : 'Tamil'}</span>
            <span className="text-white/30">•</span>
            <span className="px-4 py-1.5 glass-panel rounded-md">Dir: <span className="text-white">{movie.director}</span></span>
          </div>

          <p className="text-lg md:text-2xl text-gray-300 leading-relaxed font-light mb-12 max-w-2xl border-l-4 border-neon-cyan/50 pl-6 py-2">
            {movie.synopsis}
          </p>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-8 md:mt-0">
            <button 
              onClick={toggleDiorama}
              className="flex items-center justify-center gap-3 bg-white text-black px-6 py-3 md:px-8 md:py-4 rounded-full font-black uppercase tracking-[0.2em] hover:bg-neon-cyan hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,229,255,0.6)] w-full md:w-auto text-sm md:text-base"
            >
              <Play fill="currentColor" size={24} />
              Enter Void
            </button>
            <button
              onClick={() => alert(`Unique Constellation Link created:\naetheria.app/watch/${movie.id}?party=Kx9B`)}
              className="flex items-center justify-center gap-3 bg-transparent border border-white/20 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold uppercase tracking-widest hover:border-bright-coral hover:text-bright-coral transition-colors w-full md:w-auto text-sm md:text-base glass-panel"
            >
              <Users size={20} />
              Invite to Constellation
            </button>
          </div>
        </motion.div>

        {/* Floating Cast Nodes */}
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 flex-col gap-6 -mt-8 hidden lg:flex"
        >
          <div className="text-right mb-4">
            <h3 className="text-neon-cyan text-xs uppercase tracking-[0.3em] font-bold flex items-center justify-end gap-2 drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
               Constellation
            </h3>
          </div>
          {movie.cast.map((member, i) => (
            <motion.div 
              key={i}
              whileHover={{ x: -15, scale: 1.05 }}
              className="glass-panel p-4 rounded-2xl flex items-center gap-5 cursor-pointer w-72 justify-end group border-r-4 border-white/10 hover:border-neon-cyan transition-all duration-300 hover:bg-white/5 shadow-2xl"
            >
              <div className="text-right">
                <p className="text-white font-bold text-lg">{member.name}</p>
                <p className="text-gray-400 text-xs tracking-wider uppercase mt-1">as {member.character}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-void-deep/80 flex items-center justify-center border border-white/10 group-hover:border-neon-cyan group-hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all shrink-0">
                <Hash size={20} className="text-neon-cyan opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </motion.div>

      </motion.div>

      {/* Social Constellations (Watch-Party Chat overlay) */}
      {!isDioramaActive && (
        <div className="pointer-events-none absolute inset-0 z-[60]">
           <ConstellationUI movieTitle={movie.title} />
        </div>
      )}

      {/* CUSTOM MEDIA PLAYER OVERLAY */}
      <AnimatePresence>
        {isDioramaActive && (
          <>
            {/* Exit Player Button */}
            <motion.div 
              initial={{ opacity: 0, scale: 0, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0, rotate: 90 }}
              className="absolute top-4 right-4 md:top-8 md:right-8 z-[100] pointer-events-auto"
            >
              <button 
                onClick={toggleDiorama}
                className="flex items-center justify-center bg-black/60 hover:bg-bright-coral text-white p-3 md:p-4 rounded-full glass-panel transition-all shadow-2xl hover:shadow-[0_0_20px_rgba(255,82,82,0.8)]"
              >
                <X size={20} className="md:w-[24px] md:h-[24px]" />
              </button>
            </motion.div>

            {/* Sync Toast overlay */}
            <AnimatePresence>
              {syncToast.visible && (
                <motion.div
                  initial={{ opacity: 0, y: -50, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: -20, x: '-50%' }}
                  className="absolute top-8 left-1/2 z-[110] bg-black/80 backdrop-blur-md border border-bright-coral/50 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(255,82,82,0.4)]"
                >
                  <Users size={16} className="text-bright-coral" />
                  <span className="text-xs font-bold tracking-widest uppercase">{syncToast.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glassmorphic Media Control Bar */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 h-28 md:h-32 bg-gradient-to-t from-black/95 via-black/80 to-transparent z-[100] flex flex-col justify-end pb-6 md:pb-8 px-4 md:px-16 pointer-events-auto"
            >
              
              {/* Timeline Scrubber */}
              <div className="w-full h-3 md:h-1 group relative mb-4">
                <input
                  type="range"
                  min={0}
                  max={0.999}
                  step="any"
                  value={played}
                  onMouseDown={() => setPlaying(false)}
                  onTouchStart={() => setPlaying(false)}
                  onChange={handleSeekChange}
                  onMouseUp={() => setPlaying(true)}
                  onTouchEnd={() => setPlaying(true)}
                  className="w-full absolute inset-0 opacity-0 z-10 cursor-pointer"
                />
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden absolute inset-0 my-auto pointer-events-none transition-all group-hover:h-3">
                  <div 
                    className="h-full bg-neon-cyan shadow-[0_0_15px_rgba(0,229,255,0.8)]"
                    style={{ width: `${played * 100}%` }}
                  />
                </div>
              </div>

              {/* Controls Container */}
              <div className="flex items-center justify-between mt-2">
                
                {/* Left Controls */}
                <div className="flex items-center gap-4 md:gap-6">
                  <button onClick={togglePlayPause} className="text-white hover:text-neon-cyan transition-transform hover:scale-110">
                    {playing ? <Pause fill="currentColor" size={28} /> : <Play fill="currentColor" size={28} />}
                  </button>
                  
                  <button onClick={() => skipTime(-10)} className="text-white/70 hover:text-neon-cyan transition-colors hidden md:block">
                    <RotateCcw size={20} />
                  </button>
                  <button onClick={() => skipTime(10)} className="text-white/70 hover:text-neon-cyan transition-colors hidden md:block">
                    <RotateCw size={20} />
                  </button>

                  <div className="flex items-center gap-3 group">
                    <button onClick={toggleMute} className="text-white hover:text-neon-cyan transition-colors">
                      {muted || volume === 0 ? <VolumeX size={20} className="md:w-[24px] md:h-[24px]"/> : <Volume2 size={20} className="md:w-[24px] md:h-[24px]"/>}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step="any"
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-0 group-hover:w-20 md:group-hover:w-24 transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer accent-neon-cyan hidden md:block"
                    />
                  </div>
                </div>

                {/* Movie Title */}
                <h3 className="text-white/60 text-sm tracking-[0.2em] font-bold uppercase hidden md:block">
                  {movie.title} <span className="text-neon-cyan font-normal drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]">| ENCRYPTED STREAM</span>
                </h3>

                {/* Right Controls */}
                <div className="flex items-center gap-4 md:gap-6">
                  <button onClick={togglePlaybackRate} className="text-white/70 hover:text-neon-cyan transition-colors flex items-center gap-1 font-bold text-xs">
                    <Gauge size={18} /> {playbackRate}x
                  </button>
                  <button onClick={toggleScreenMode} className="text-white/70 hover:text-neon-cyan transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest hidden md:flex" title={`Screen Mode: ${screenMode}`}>
                    <MonitorPlay size={18} />
                    {screenMode}
                  </button>
                  <span className="text-neon-cyan/70 font-black text-[10px] tracking-[0.3em] uppercase border border-neon-cyan/30 px-2 py-1 rounded hidden md:block">4K HDR</span>
                  <button onClick={handleFullscreen} className="text-white hover:text-neon-cyan transition-colors hover:scale-110">
                    <Maximize size={24} />
                  </button>
                </div>

              </div>
            </motion.div>

            {/* Cinemascope Black Bars */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: "4vh" }}
              exit={{ height: 0 }}
              className="absolute top-0 left-0 right-0 bg-black z-[90] pointer-events-none"
            />
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: "4vh" }}
              exit={{ height: 0 }}
              className="absolute bottom-0 left-0 right-0 bg-black z-[90] pointer-events-none"
            />

            {/* Skip Intro Button */}
            <AnimatePresence>
              {showSkipIntro && (
                <motion.button
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  onClick={handleSkipIntro}
                  className="absolute bottom-36 right-12 z-[110] bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors shadow-2xl"
                >
                  Skip Intro
                </motion.button>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
