import React, { useState, useEffect, useRef } from 'react';
import { SaveData } from '../types';
import { Network, MessageSquare, Shield, HelpCircle, Sparkles, Send } from 'lucide-react';

interface NetworkLobbyHubProps {
  saveData: SaveData;
  updateSaveData: (updater: (prev: SaveData) => SaveData) => void;
  onBack: () => void;
  onLaunchSimulatedGame: (mode: 'CO_OP' | 'PVP') => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  color: string;
}

export default function NetworkLobbyHub({ saveData, updateSaveData, onBack, onLaunchSimulatedGame }: NetworkLobbyHubProps) {
  const [activeTab, setActiveTab] = useState<'MATCHMAKING' | 'GLOBAL_CHAT'>('MATCHMAKING');
  const [isSearching, setIsSearching] = useState(false);
  const [searchLog, setSearchLog] = useState<string[]>([]);
  const [searchProgress, setSearchProgress] = useState(0);
  const [activeRoomId, setActiveRoomId] = useState('');
  const [matchMode, setMatchMode] = useState<'CO_OP' | 'PVP'>('CO_OP');

  // Chat message logs state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'FlameLord99', text: 'Flame Towers are insane on Stage 2, easy burn stacks!', time: '10:52', color: 'text-emerald-400' },
    { id: '2', sender: 'BoneCrafter', text: 'Skeletal Legion lifesteal keeps summons alive forever.', time: '10:53', color: 'text-emerald-400' },
    { id: '3', sender: 'GemmaSlayer', text: 'Anyone unlocked the Mythic Arcane blueprint yet? Rolled standard parameters.', time: '10:54', color: 'text-emerald-400' },
  ]);
  const [typedChatInput, setTypedChatInput] = useState('');

  // Floating emotes test canvas
  const [activeEmotes, setActiveEmotes] = useState<{ x: number; y: number; text: string; age: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Periodic scrolling text generator for global live live chat channels
  useEffect(() => {
    const MOCK_MESSAGES = [
      'Need an active guild for weekly Citadel boss raids!',
      'Tar Bog trap + Inferno Flame burn ticks is a lethal combo.',
      'Just cleared wave 45 on Infinite Rift! Permanent DPS multipliers help so much.',
      'Duo Co-Op mode is sick, shared master health adds so much coordination.',
      'Death Knight boss life drains and summons bone shields, be careful!',
    ];
    const MOCK_SENDERS = ['StormVanguard', 'LichMaster', 'VoidStalker_X', 'GlacialRune', 'OgreSmasher'];
    const MOCK_COLORS = ['text-emerald-400', 'text-emerald-400', 'text-emerald-400', 'text-emerald-400', 'text-emerald-400'];

    const interval = setInterval(() => {
      const randomText = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
      const randomSender = MOCK_SENDERS[Math.floor(Math.random() * MOCK_SENDERS.length)];
      const randomColor = MOCK_COLORS[Math.floor(Math.random() * MOCK_COLORS.length)];

      const date = new Date();
      const timestamp = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

      setChatMessages(prev => [
        ...prev,
        {
          id: `chat_${Date.now()}`,
          sender: randomSender,
          text: randomText,
          time: timestamp,
          color: randomColor,
        },
      ]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Emotes physics ticks inside matching canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw starry ambient space grid
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Physics float upward for emotes
      setActiveEmotes(prev => {
        const next = prev
          .map(e => ({
            ...e,
            y: e.y - 1.2, // move up
            age: e.age + 1,
          }))
          .filter(e => e.age < 60); // decay after 1 second

        next.forEach(e => {
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#10b981';
          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 12px monospace';
          // Draw neat balloon container
          ctx.fillText(`💬 ${e.text}`, e.x, e.y);
          ctx.restore();
        });

        return next;
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [activeEmotes]);

  // Click on lobby canvas places a test floating emote ping bubble
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const phrases = ['GG!', 'DEFEND HERE!', 'DANGER!', 'NICE!', 'NEED HELP!'];
    const chosenPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    setActiveEmotes(prev => [...prev, { x: clickX, y: clickY, text: chosenPhrase, age: 0 }]);
  };

  // Triggers peer network loading simulation logs
  const handleStartSearch = (mode: 'CO_OP' | 'PVP') => {
    setIsSearching(true);
    setSearchProgress(0);
    setMatchMode(mode);
    setSearchLog(['[SOCKET] INITIALIZING WEBRTC NET-NODE PROTOCOL...', '[SOCKET] ACQUIRING STUN STUNT ROUTERS...']);

    let step = 0;
    const logs = [
      '[STUN] NAT TYPE DETECTED: OPEN SYNC CODES',
      '[ROUTER] GENERATING MULTI-PEER SYNC ROOM ID: #ZEX-992',
      '[MATCH] PEERS DETECTED IN REGION US-WEST-2 (PING: 24MS)',
      '[HANDSHAKE] SHARING ENCRYPTION CODES...',
      '[HANDSHAKE] SYNC CODES VERIFIED SUCCESSFULLY!',
      '[MATCH] ESTABLISHED! LAUNCHING ACTIVE CANVAS MULTIPLAYER DECK...',
    ];

    const timer = setInterval(() => {
      step++;
      setSearchProgress(prev => Math.min(100, prev + 16.6));

      if (step <= logs.length) {
        setSearchLog(prev => [...prev, logs[step - 1]]);
      } else {
        clearInterval(timer);
        setIsSearching(false);
        setActiveRoomId('#ZEX-992');
        // Launch actual multiplayer simulated map state inside Game Engine!
        onLaunchSimulatedGame(mode);
      }
    }, 1000);
  };

  const handleSendChatMessage = () => {
    if (!typedChatInput.trim()) return;

    setChatMessages(prev => [
      ...prev,
      {
        id: `chat_self_${Date.now()}`,
        sender: 'YOU (COMMANDER)',
        text: typedChatInput.toUpperCase(),
        time: 'Now',
        color: 'text-emerald-400 font-bold',
      },
    ]);

    setTypedChatInput('');
  };

  return (
    <div id="lobby-screen" className="flex flex-col h-full bg-neutral-950 text-emerald-500 p-6 overflow-y-auto bg-[radial-gradient(#10b9810d_1px,transparent_1px)] [background-size:16px_16px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-emerald-900 pb-4">
        <div className="flex items-center gap-3">
          <Network className="text-emerald-400 w-8 h-8 animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-400 uppercase font-mono">
              The Multiplayer Arena
            </h1>
            <p className="text-xs text-emerald-600 font-mono">Join Duo Co-Op or 1v1 PvP versus, chat on servers, and deploy ping emotes</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-neutral-900 hover:bg-emerald-500 hover:text-black text-white font-semibold font-mono rounded border border-emerald-850 shadow-lg cursor-pointer transition"
        >
          &lt; MAIN MENU
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('MATCHMAKING')}
          className={`flex-1 py-3 font-mono text-xs tracking-widest uppercase transition border cursor-pointer rounded ${
            activeTab === 'MATCHMAKING'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
              : 'bg-neutral-900/50 border border-emerald-950/80 text-emerald-600 hover:bg-neutral-900/80 hover:text-emerald-400'
          }`}
        >
          🔗 Peer Matchmaking Lobby
        </button>
        <button
          onClick={() => setActiveTab('GLOBAL_CHAT')}
          className={`flex-1 py-3 font-mono text-xs tracking-widest uppercase transition border cursor-pointer rounded ${
            activeTab === 'GLOBAL_CHAT'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-bold'
              : 'bg-neutral-900/50 border border-emerald-950/80 text-emerald-600 hover:bg-neutral-900/80 hover:text-emerald-400'
          }`}
        >
          💬 Global Server Chat Channels
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column depending on tab */}
        <div className="lg:col-span-2 rounded-lg border border-emerald-900 bg-neutral-900/50 p-5 flex flex-col justify-between shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          {activeTab === 'MATCHMAKING' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-2">
                📡 Peer-To-Peer Matchmaking portal
              </h2>

              {isSearching ? (
                /* Simulated Connection Terminal Matrix */
                <div className="bg-neutral-950 border border-emerald-950 rounded-lg p-5 font-mono text-[10px] text-emerald-400 h-64 overflow-y-auto flex flex-col justify-between shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]">
                  <div className="flex flex-col gap-1">
                    {searchLog.map((log, index) => (
                      <div key={index} className="animate-pulse">{log}</div>
                    ))}
                  </div>

                  {/* Progress loading bar */}
                  <div className="mt-4 pt-2 border-t border-emerald-950/60">
                    <div className="flex justify-between text-[9px] text-emerald-500 uppercase mb-1">
                      <span>SYNCING SOCKET: NETWORK HANDSHAKE</span>
                      <span>{Math.round(searchProgress)}%</span>
                    </div>
                    <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden border border-emerald-950">
                      <div
                        className="bg-emerald-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${searchProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Select match modes buttons */
                <div className="flex flex-col md:flex-row gap-4 h-64 items-center justify-center">
                  <button
                    onClick={() => handleStartSearch('CO_OP')}
                    className="flex-1 w-full h-full rounded border border-emerald-900/40 bg-emerald-950/5 hover:bg-emerald-950/25 p-5 flex flex-col justify-between text-center transition cursor-pointer"
                  >
                    <div>
                      <span className="text-3xl">👥</span>
                      <h3 className="font-mono font-bold text-emerald-400 uppercase text-xs mt-3">Duo Co-Op Mode</h3>
                      <p className="text-[10px] text-emerald-600 font-mono leading-relaxed mt-2">
                        Split canvas defenses with peer partner! Build together on dual-lane paths and share a unified base health reserve pool.
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase mt-4 block">SEARCH MATCH &rarr;</span>
                  </button>

                  <button
                    onClick={() => handleStartSearch('PVP')}
                    className="flex-1 w-full h-full rounded border border-red-900/40 bg-red-950/5 hover:bg-red-950/25 p-5 flex flex-col justify-between text-center transition cursor-pointer"
                  >
                    <div>
                      <span className="text-3xl">⚔️</span>
                      <h3 className="font-mono font-bold text-red-400 uppercase text-xs mt-3">1v1 PvP Versus</h3>
                      <p className="text-[10px] text-red-600 font-mono leading-relaxed mt-2">
                        Competitive duel. Defeating runners on your lane sends specialized Curse Minions to flood your opponent's play screen grid.
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-red-400 font-bold uppercase mt-4 block">SEARCH MATCH &rarr;</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'GLOBAL_CHAT' && (
            <div className="flex flex-col h-full gap-4">
              <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-2 mb-2">
                💬 Live Server Chat Log channels
              </h2>

              {/* Chat log displays */}
              <div className="flex-1 bg-neutral-950 border border-emerald-950 rounded p-4 overflow-y-auto font-mono text-xs flex flex-col gap-3 min-h-[220px] shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="flex gap-2 leading-relaxed">
                    <span className="text-emerald-700">[{msg.time}]</span>
                    <span className="text-emerald-400 font-bold">{msg.sender}:</span>
                    <span className="text-emerald-300 flex-1">{msg.text}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={typedChatInput}
                  onChange={e => setTypedChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Type strategic chatter..."
                  className="flex-1 bg-neutral-950 border border-emerald-950 rounded p-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleSendChatMessage}
                  className="px-4 bg-emerald-900 hover:bg-emerald-700 border border-emerald-500 text-white rounded font-mono text-xs font-bold uppercase cursor-pointer transition flex items-center justify-center gap-1"
                >
                  <Send className="w-4 h-4" /> SEND
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Emote test wheel */}
        <div className="lg:col-span-1 rounded-lg border border-emerald-900 bg-neutral-900/50 p-5 flex flex-col justify-between shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          <div>
            <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-2 flex items-center gap-2">
              👾 Interactive Emotes Deck
            </h2>
            <p className="text-[10px] text-emerald-600 font-mono mb-4 leading-relaxed">
              Click anywhere on the radar canvas block below to ping quick tactical messages to simulated teammates!
            </p>

            <div className="border border-emerald-950 rounded overflow-hidden aspect-square w-full">
              <canvas
                ref={canvasRef}
                width={260}
                height={260}
                onClick={handleCanvasClick}
                className="w-full h-full cursor-pointer block"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-neutral-950 border border-emerald-950 rounded text-[11px] leading-relaxed text-emerald-600 font-mono flex gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>
              Emotes triggered here simulate in-game ping signals, placing temporary floating banners above active coordinates on co-op fields.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
