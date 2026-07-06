import React, { useState, useRef, useEffect } from 'react';
import { SaveData, Stage } from '../types';
import { Map, Edit3, Clipboard, Check, RefreshCw, HelpCircle, Hammer } from 'lucide-react';

interface SandboxLevelEditorProps {
  saveData: SaveData;
  updateSaveData: (updater: (prev: SaveData) => SaveData) => void;
  onBack: () => void;
}

export default function SandboxLevelEditor({ saveData, updateSaveData, onBack }: SandboxLevelEditorProps) {
  // Tile states: 0 = path, 1 = buildable grid, 2 = obstacle, 3 = spawn portal, 4 = base core
  const [grid, setGrid] = useState<number[][]>(() => [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [3, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 4],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ]);

  const [activeBrush, setActiveBrush] = useState<number>(0); // Matches tile states
  const [importString, setImportString] = useState('');
  const [exportString, setExportString] = useState('');
  const [validationMessage, setValidationMessage] = useState('UNVALIDATED');
  const [isPathValid, setIsPathValid] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redraw painted grid on editor Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = grid.length;
    const cols = grid[0].length;
    const tileW = canvas.width / cols;
    const tileH = canvas.height / rows;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = grid[r][c];

        // Style depending on coordinate role
        if (val === 0) {
          ctx.fillStyle = '#0a2e1f'; // Dirt path
        } else if (val === 1) {
          ctx.fillStyle = '#020617'; // Buildable field
        } else if (val === 2) {
          ctx.fillStyle = '#7f1d1d'; // Boulder Obstacle
        } else if (val === 3) {
          ctx.fillStyle = '#4c1d95'; // Spawn Portal (violet portal)
        } else if (val === 4) {
          ctx.fillStyle = '#065f46'; // Base Core (moss green core)
        }

        ctx.fillRect(c * tileW, r * tileH, tileW - 1, tileH - 1);

        // Draw inner glyphs for indicators
        if (val === 3) {
          ctx.fillStyle = '#a5b4fc';
          ctx.font = '10px monospace';
          ctx.fillText('PORTAL', c * tileW + 5, r * tileH + 20);
        } else if (val === 4) {
          ctx.fillStyle = '#34d399';
          ctx.font = '10px monospace';
          ctx.fillText('CORE', c * tileW + 10, r * tileH + 20);
        } else if (val === 2) {
          ctx.fillStyle = '#fca5a5';
          ctx.font = '10px monospace';
          ctx.fillText('✖', c * tileW + 14, r * tileH + 20);
        }
      }
    }
  }, [grid]);

  // Click on grid tile paints it with selected brush active
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const cols = grid[0].length;
    const rows = grid.length;
    const tileW = canvas.width / cols;
    const tileH = canvas.height / rows;

    const colIndex = Math.floor(clickX / tileW);
    const rowIndex = Math.floor(clickY / tileH);

    if (rowIndex >= 0 && rowIndex < rows && colIndex >= 0 && colIndex < cols) {
      const nextGrid = grid.map((r, ri) =>
        r.map((val, ci) => (ri === rowIndex && ci === colIndex ? activeBrush : val))
      );
      setGrid(nextGrid);
    }
  };

  // BFS Path Verification Solver
  const handleValidateMap = () => {
    // 1. Locate portal coordinates and base core coordinates
    let portal: { r: number; c: number } | null = null;
    let core: { r: number; c: number } | null = null;

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        if (grid[r][c] === 3) portal = { r, c };
        if (grid[r][c] === 4) core = { r, c };
      }
    }

    if (!portal || !core) {
      setValidationMessage('FAIL: Map requires exactly 1 Spawn Portal and 1 Base Core!');
      setIsPathValid(false);
      return;
    }

    // 2. Perform BFS search over path elements (0, 3, 4 are walkables)
    const queue: { r: number; c: number; path: { x: number; y: number }[] }[] = [];
    const visited = new Set<string>();

    queue.push({ r: portal.r, c: portal.c, path: [{ x: portal.c, y: portal.r }] });
    visited.add(`${portal.r},${portal.c}`);

    let pathFound: { x: number; y: number }[] | null = null;

    while (queue.length > 0) {
      const curr = queue.shift()!;

      if (curr.r === core.r && curr.c === core.c) {
        pathFound = curr.path;
        break;
      }

      // Check adjacent cardinal cells
      const directions = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
      ];

      for (const d of directions) {
        const nr = curr.r + d.dr;
        const nc = curr.c + d.dc;
        const key = `${nr},${nc}`;

        if (
          nr >= 0 &&
          nr < grid.length &&
          nc >= 0 &&
          nc < grid[0].length &&
          !visited.has(key)
        ) {
          const tile = grid[nr][nc];
          if (tile === 0 || tile === 4) {
            visited.add(key);
            queue.push({
              r: nr,
              c: nc,
              path: [...curr.path, { x: nc, y: nr }],
            });
          }
        }
      }
    }

    if (pathFound) {
      setValidationMessage(`SUCCESS: Valid lane detected with ${pathFound.length} waypoints!`);
      setIsPathValid(true);

      // Compile coordinates to JSON string
      const compiledJSON = JSON.stringify({
        id: 'custom_map',
        name: 'My Custom Sandbox',
        description: 'Self-engineered battlefield coordinate matrix',
        lanes: [pathFound],
        mapGrid: grid,
        enemySpeedMultiplier: 1.0,
        baseGold: 500,
        baseMana: 150,
      });

      setExportString(btoa(compiledJSON)); // encode to base64 for compact copy pasting
    } else {
      setValidationMessage('FAIL: No walkable path connects Portal to Core!');
      setIsPathValid(false);
    }
  };

  const handleImportMap = () => {
    try {
      const parsed = JSON.parse(atob(importString));
      if (parsed.mapGrid && parsed.lanes) {
        setGrid(parsed.mapGrid);
        alert('Custom sandbox map loaded into painted grid successfully!');
      } else {
        alert('Invalid Custom Map base64 string format!');
      }
    } catch (e) {
      alert('Error parsing custom string. Make sure it is completely intact.');
    }
  };

  const handleSaveCustomToProfile = () => {
    if (!isPathValid) {
      alert('You must validate and get a SUCCESS response before caching!');
      return;
    }

    updateSaveData(prev => ({
      ...prev,
      customMapJson: exportString,
    }));

    alert('Custom Sandbox Map cached inside local profile! It is now selectable in the Map Selector screen.');
  };

  return (
    <div id="sandbox-screen" className="flex flex-col h-full bg-neutral-950 text-emerald-500 p-6 overflow-y-auto font-mono bg-[radial-gradient(#10b9810d_1px,transparent_1px)] [background-size:16px_16px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-emerald-900 pb-4">
        <div className="flex items-center gap-3">
          <Hammer className="text-emerald-400 w-8 h-8 animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-400 uppercase font-mono">
              Sandbox Map Level Editor
            </h1>
            <p className="text-xs text-emerald-600">Paint layouts, solve paths with validation engines, and share map codes</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-neutral-900 hover:bg-emerald-500 hover:text-black text-white font-semibold font-mono rounded border border-emerald-850 shadow-lg cursor-pointer transition"
        >
          &lt; MAIN MENU
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Painted Canvas Grid */}
        <div className="lg:col-span-2 rounded-lg border border-emerald-900 bg-neutral-900/50 p-5 flex flex-col justify-between shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          <div>
            <div className="flex justify-between items-center mb-3 font-mono text-xs text-emerald-600">
              <span>PAINT LAYER BOARD (16 x 12 GRID MATRIX)</span>
              <span>Click cells to paint active brush role</span>
            </div>

            <div className="border border-emerald-950 rounded overflow-hidden aspect-[4/3] bg-neutral-950">
              <canvas
                ref={canvasRef}
                width={560}
                height={420}
                onClick={handleCanvasClick}
                className="w-full h-full cursor-crosshair block"
              />
            </div>
          </div>

          {/* Controls row */}
          <div className="mt-4 flex flex-wrap gap-2 justify-between items-center font-mono text-xs">
            {/* Paint brush pickers */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { val: 0, label: '🛣 Dirt Path', color: 'bg-[#0a2e1f] border-emerald-900' },
                { val: 1, label: '🧱 Build tile', color: 'bg-[#020617] border-emerald-950/50' },
                { val: 2, label: '✖ Rock Block', color: 'bg-[#7f1d1d] border-red-950' },
                { val: 3, label: 'Portal', color: 'bg-[#4c1d95] border-indigo-950' },
                { val: 4, label: 'Core', color: 'bg-[#065f46] border-emerald-950' },
              ].map(brush => (
                <button
                  key={brush.val}
                  onClick={() => setActiveBrush(brush.val)}
                  className={`px-3 py-1.5 rounded border text-[10px] font-bold cursor-pointer transition uppercase ${brush.color} ${
                    activeBrush === brush.val
                      ? 'border-emerald-400 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                      : 'text-emerald-700 hover:text-emerald-500'
                  }`}
                >
                  {brush.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleValidateMap}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold font-mono text-[10px] uppercase rounded cursor-pointer border border-emerald-700 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Validate Path coordinates
            </button>
          </div>
        </div>

        {/* Right Column: Code Terminal & Importer */}
        <div className="lg:col-span-1 rounded-lg border border-emerald-900 bg-neutral-900/50 p-5 flex flex-col justify-between shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-2">
              💻 Validation & Share Console
            </h2>

            {/* Validation Message display box */}
            <div
              className={`p-3 rounded border font-mono text-[10px] uppercase font-bold text-center leading-snug ${
                isPathValid
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                  : 'bg-red-950/20 border-red-500/30 text-red-400'
              }`}
            >
              {validationMessage}
            </div>

            {/* Export Terminal */}
            {isPathValid && (
              <div className="font-mono text-xs">
                <label className="text-emerald-700 block mb-1">EXPORT MAP STRING CODE:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={exportString}
                    className="flex-1 bg-neutral-950 border border-emerald-950 rounded p-1.5 text-[10px] text-emerald-300 font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(exportString);
                      alert('Custom map string copied to clipboard!');
                    }}
                    className="px-2.5 bg-neutral-900 hover:bg-emerald-500 hover:text-black text-white rounded cursor-pointer transition border border-emerald-950 flex items-center justify-center"
                    title="Copy string"
                  >
                    <Clipboard className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleSaveCustomToProfile}
                  className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold tracking-widest uppercase rounded cursor-pointer transition border border-emerald-700 flex justify-center items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Cache Custom Map to Selector
                </button>
              </div>
            )}

            {/* Import Terminal */}
            <div className="font-mono text-xs border-t border-emerald-950 pt-4">
              <label className="text-emerald-700 block mb-1">IMPORT MAP STRING CODE:</label>
              <div className="flex flex-col gap-2">
                <textarea
                  value={importString}
                  onChange={e => setImportString(e.target.value)}
                  placeholder="Paste custom map base64 coordinates string here..."
                  className="w-full bg-neutral-950 border border-emerald-950 rounded p-2 text-[10px] text-emerald-300 font-mono h-20 resize-none focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={handleImportMap}
                  className="py-2 bg-neutral-900 hover:bg-emerald-500 hover:text-black border border-emerald-850 text-white font-mono text-[10px] font-bold tracking-widest uppercase rounded cursor-pointer transition"
                >
                  Load painted grid from code
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-neutral-950 border border-emerald-950 rounded text-[11px] leading-relaxed text-emerald-600 font-mono flex gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>
              For a map to validate, there must be a continuous series of cardinal path blocks (🛣) linking exactly one Portal cell to exactly one Core cell.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
