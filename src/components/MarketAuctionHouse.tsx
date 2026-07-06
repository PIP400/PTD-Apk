import React, { useState, useEffect } from 'react';
import { SaveData, ElementType } from '../types';
import { ShoppingBag, Search, Tag, DollarSign, HelpCircle, ArrowDownUp } from 'lucide-react';

interface MarketAuctionHouseProps {
  saveData: SaveData;
  updateSaveData: (updater: (prev: SaveData) => SaveData) => void;
  onBack: () => void;
}

interface AuctionItem {
  id: string;
  name: string;
  seller: string;
  rarity: string;
  itemType: string;
  element: ElementType;
  price: number;
  timeLeft: string;
}

export default function MarketAuctionHouse({ saveData, updateSaveData, onBack }: MarketAuctionHouseProps) {
  const [filterRarity, setFilterRarity] = useState('ALL');
  const [filterElement, setFilterElement] = useState('ALL');
  const [activeMarketItems, setActiveMarketItems] = useState<AuctionItem[]>([]);
  const [listingPrice, setListingPrice] = useState(150);
  const [selectedAssetToList, setSelectedAssetToList] = useState<ElementType>('FLAME');

  // Hardcoded base market entries
  const BASE_MARKET_ITEMS: AuctionItem[] = [
    { id: 'a1', name: 'Mythic Arcane Shard Core', seller: 'VoidTrader_88', rarity: 'MYTHIC', itemType: 'BLUEPRINT', element: 'ARCANE', price: 1800, timeLeft: '12h 45m' },
    { id: 'a2', name: 'Inferno Firestone Rune', seller: 'FlameLover', rarity: 'COMMON', itemType: 'MATERIAL', element: 'FLAME', price: 80, timeLeft: '22h 10m' },
    { id: 'a3', name: 'Chain Voltage Copper Core', seller: 'StormSeeker', rarity: 'EPIC', itemType: 'BLUEPRINT', element: 'THUNDER', price: 650, timeLeft: '4h 15m' },
    { id: 'a4', name: 'Glacial Spires Frost Shard', seller: 'FreezeLord', rarity: 'RARE', itemType: 'BLUEPRINT', element: 'FROST', color: '#00BCD4', price: 250, timeLeft: '1h 30m' } as any,
    { id: 'a5', name: 'Abyssal Nova Core Essence', seller: 'DarkArts', rarity: 'EPIC', itemType: 'BLUEPRINT', element: 'DARK', price: 720, timeLeft: '19h 50m' },
  ];

  useEffect(() => {
    setActiveMarketItems(BASE_MARKET_ITEMS);
  }, []);

  // Simulates market order fluctuations (changing prices slightly to emulate real traders)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMarketItems(prev =>
        prev.map(item => {
          // Fluctuates within -5% to +5% range
          const change = Math.floor(item.price * (Math.random() * 0.1 - 0.05));
          return {
            ...item,
            price: Math.max(50, item.price + change),
          };
        })
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Purchase item
  const handleBuyItem = (item: AuctionItem) => {
    if (saveData.gold < item.price) {
      alert('Insufficient gold in wallet to purchase this listing!');
      return;
    }

    updateSaveData(prev => {
      const nextUnlocked = [...prev.unlockedTowers];
      if (!nextUnlocked.includes(item.element)) {
        nextUnlocked.push(item.element);
      }
      return {
        ...prev,
        gold: prev.gold - item.price,
        unlockedTowers: nextUnlocked,
      };
    });

    // Remove item from listings upon buy
    setActiveMarketItems(prev => prev.filter(i => i.id !== item.id));
    alert(`Successfully bought "${item.name}" for ${item.price} Gold! Core unlocked in inventory.`);
  };

  // Sell item from inventory
  const handleSellItem = () => {
    const isUnlocked = saveData.unlockedTowers.includes(selectedAssetToList);
    if (!isUnlocked) {
      alert('You must unlock this tower blueprint first before listing on the public exchange!');
      return;
    }

    const newListing: AuctionItem = {
      id: `a_self_${Date.now()}`,
      name: `Core Catalyst (${selectedAssetToList})`,
      seller: 'YOU (COMMANDER)',
      rarity: 'RARE',
      itemType: 'BLUEPRINT',
      element: selectedAssetToList,
      price: listingPrice,
      timeLeft: '24h 00m',
    };

    setActiveMarketItems(prev => [newListing, ...prev]);

    // Debit level in simulation
    updateSaveData(prev => {
      const currentLevel = prev.weaponLevels[selectedAssetToList] || 1;
      const nextLevels = { ...prev.weaponLevels };
      if (currentLevel > 1) {
        nextLevels[selectedAssetToList] = currentLevel - 1;
      }
      return {
        ...prev,
        weaponLevels: nextLevels,
      };
    });

    alert(`Successfully listed ${selectedAssetToList} core blueprint on the public market board for ${listingPrice} Gold!`);
  };

  // Filter listings
  const filteredListings = activeMarketItems.filter(item => {
    if (filterRarity !== 'ALL' && item.rarity !== filterRarity) return false;
    if (filterElement !== 'ALL' && item.element !== filterElement) return false;
    return true;
  });

  return (
    <div id="auction-screen" className="flex flex-col h-full bg-neutral-950 text-emerald-500 p-6 overflow-y-auto bg-[radial-gradient(#10b9810d_1px,transparent_1px)] [background-size:16px_16px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-emerald-900 pb-4 font-sans">
        <div className="flex items-center gap-3">
          <ShoppingBag className="text-emerald-400 w-8 h-8 animate-bounce" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-400 uppercase font-mono">
              The Grand Auction House
            </h1>
            <p className="text-xs text-emerald-600 font-mono">Fluctuating order book, buy listings, and trade spare assets</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded border border-emerald-900 font-mono text-sm">
            <span className="text-emerald-700">GOLD:</span>
            <span className="font-bold text-orange-400">
              {saveData.gold.toLocaleString()}g
            </span>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-neutral-900 hover:bg-emerald-500 hover:text-black text-white font-semibold font-mono rounded border border-emerald-850 shadow-lg cursor-pointer transition"
          >
            &lt; MAIN MENU
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Live Listings Board */}
        <div className="lg:col-span-2 rounded-lg border border-emerald-900 bg-neutral-900/50 p-5 flex flex-col justify-between shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 font-mono">
              <h2 className="text-xs font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-2">
                📈 Live public Board Listings
              </h2>

              {/* Board filtering selection */}
              <div className="flex gap-2 text-xs">
                <select
                  value={filterRarity}
                  onChange={e => setFilterRarity(e.target.value)}
                  className="bg-neutral-950 border border-emerald-900 rounded px-2 py-1 text-emerald-400 outline-none cursor-pointer"
                >
                  <option value="ALL">All Rarities</option>
                  <option value="COMMON">Common</option>
                  <option value="RARE">Rare</option>
                  <option value="EPIC">Epic</option>
                  <option value="MYTHIC">Mythic</option>
                </select>

                <select
                  value={filterElement}
                  onChange={e => setFilterElement(e.target.value)}
                  className="bg-neutral-950 border border-emerald-900 rounded px-2 py-1 text-emerald-400 outline-none cursor-pointer"
                >
                  <option value="ALL">All Elements</option>
                  <option value="FLAME">Flame</option>
                  <option value="FROST">Frost</option>
                  <option value="THUNDER">Thunder</option>
                  <option value="POISON">Poison</option>
                  <option value="EARTH">Earth</option>
                  <option value="WIND">Wind</option>
                  <option value="WATER">Water</option>
                  <option value="LIGHT">Light</option>
                  <option value="DARK">Dark</option>
                  <option value="ARCANE">Arcane</option>
                </select>
              </div>
            </div>

            {/* List entries */}
            <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1 font-mono text-xs">
              <div className="grid grid-cols-12 text-emerald-700 border-b border-emerald-950 pb-1.5 px-3 font-bold">
                <div className="col-span-5">ASSET ENTRY</div>
                <div className="col-span-3">SELLER ID</div>
                <div className="col-span-2">EXPIRY</div>
                <div className="col-span-2 text-right">BUY Price</div>
              </div>

              {filteredListings.map(item => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 bg-neutral-950/40 p-3 rounded border border-emerald-950/60 items-center px-3 hover:border-emerald-800 transition"
                >
                  <div className="col-span-5 flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">★</span>
                    <div>
                      <strong className="text-emerald-300 block truncate">{item.name}</strong>
                      <span className="text-[10px] text-emerald-700">{item.element} | {item.rarity}</span>
                    </div>
                  </div>
                  <div className="col-span-3 text-emerald-600 truncate">{item.seller}</div>
                  <div className="col-span-2 text-emerald-700">{item.timeLeft}</div>
                  <div className="col-span-2 text-right">
                    <button
                      onClick={() => handleBuyItem(item)}
                      className="px-2.5 py-1.5 bg-neutral-950 hover:bg-emerald-500 hover:text-black border border-emerald-900 text-emerald-400 rounded font-bold cursor-pointer transition text-[10px]"
                    >
                      {item.price}g
                    </button>
                  </div>
                </div>
              ))}
              {filteredListings.length === 0 && (
                <div className="text-center py-6 text-emerald-700 text-xs font-mono">
                  No listings found for selection. Check back later!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Listing Desk */}
        <div className="lg:col-span-1 rounded-lg border border-emerald-900 bg-neutral-900/50 p-5 flex flex-col justify-between shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          <div>
            <h2 className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase mb-4 flex items-center gap-2">
              🏷 Sell Core blueprints desk
            </h2>

            <div className="flex flex-col gap-4 font-mono text-xs">
              <div>
                <label className="text-emerald-700 block mb-1">SELECT BLUEPRINT:</label>
                <select
                  value={selectedAssetToList}
                  onChange={e => setSelectedAssetToList(e.target.value as ElementType)}
                  className="w-full bg-neutral-950 border border-emerald-950 rounded p-2 text-emerald-300 font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {saveData.unlockedTowers.map(el => (
                    <option key={el} value={el}>{el} Core</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-emerald-700 block mb-1">LIST Price (GOLD):</label>
                <input
                  type="number"
                  min="50"
                  max="10000"
                  value={listingPrice}
                  onChange={e => setListingPrice(Math.max(50, parseInt(e.target.value) || 50))}
                  className="w-full bg-neutral-950 border border-emerald-950 rounded p-2 text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-orange-950/20 border border-orange-900 text-orange-400 text-[10px] leading-relaxed rounded font-semibold">
                <strong>WARNING:</strong> Posting a listing sacrifices 1 Blueprint Level from your personal forge. Make sure you want to trade this level!
              </div>

              <button
                onClick={handleSellItem}
                className="py-3 bg-emerald-900 border border-emerald-500 hover:bg-emerald-700 text-white font-bold font-mono text-xs tracking-widest uppercase rounded cursor-pointer transition shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              >
                Post Public listing
              </button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-neutral-950 border border-emerald-950 rounded text-[11px] leading-relaxed text-emerald-600 font-mono flex gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>
              Prices fluctuate incrementally every 4 seconds based on simulated global market volumes. Buy low, sell high!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
