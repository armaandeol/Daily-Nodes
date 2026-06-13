"use client";

import { useEffect, useState, useRef } from "react";
import { format, addDays, subDays } from "date-fns";
import { fetchNodes, createNode, reactToNode } from "./actions";
import { useAuth } from "@clerk/nextjs";

type NodeData = {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  image_signed_url?: string | null;
  logged_at: string;
  visibility: string;
  profiles?: {
    display_name: string;
    avatar_url: string | null;
  } | null;
  reactions?: {
    type: string;
    user_id: string;
    display_name: string;
  }[];
};

type ReactionType = "heart" | "thumbs_up" | "thumbs_down" | "fire";

const REACTION_EMOJIS: Record<ReactionType, string> = {
  heart: "❤️",
  thumbs_up: "👍",
  thumbs_down: "👎",
  fire: "🔥",
};

const CIRCULAR_OFFSETS: Record<ReactionType, { right: string; bottom: string }> = {
  heart: { right: "56px", bottom: "0px" },
  thumbs_up: { right: "48px", bottom: "28px" },
  thumbs_down: { right: "28px", bottom: "48px" },
  fire: { right: "0px", bottom: "56px" },
};

const CATEGORY_STYLES: Record<string, { label: string; icon: string; bg: string; text: string; border: string }> = {
  custom: { label: "Custom", icon: "✦", bg: "bg-neutral-50", text: "text-neutral-600", border: "border-neutral-200/60" },
  workout: { label: "Workout", icon: "⚡", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/50" },
  food: { label: "Food", icon: "🍏", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/50" },
  mood: { label: "Mood", icon: "✿", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200/50" },
  study: { label: "Study", icon: "📖", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200/50" },
  social: { label: "Social", icon: "👥", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200/50" },
};

export default function HomeFeed() {
  const { userId } = useAuth();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState("custom");
  const [selectedVisibility, setSelectedVisibility] = useState<"solo" | "shared">("solo");

  // Reaction interaction states
  const [nudgingReaction, setNudgingReaction] = useState<{ nodeId: string; type: ReactionType } | null>(null);
  const [hoveredPickerNodeId, setHoveredPickerNodeId] = useState<string | null>(null);

  // Caching mechanism for instant date/tab switching (Stale-While-Revalidate)
  const cacheRef = useRef<Record<string, NodeData[]>>({});
  const pickerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reaction hover state
  const [hoveredReaction, setHoveredReaction] = useState<{ nodeId: string; type: ReactionType } | null>(null);

  // Load nodes when date changes
  useEffect(() => {
    let active = true;
    const dateStr = format(currentDate, "yyyy-MM-dd");

    async function load() {
      // If we have cached data, display it immediately for a seamless transition (no visual flash)
      if (cacheRef.current[dateStr]) {
        setNodes(cacheRef.current[dateStr]);
        setLoading(false);
      } else {
        setLoading(true);
      }

      try {
        const data = await fetchNodes(dateStr);
        if (!active) return;

        // Check if fetched data is different from cache to prevent unnecessary updates
        const cachedData = cacheRef.current[dateStr];
        const isDifferent = JSON.stringify(data) !== JSON.stringify(cachedData);

        if (isDifferent) {
          cacheRef.current[dateStr] = data;
          setNodes(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    load();

    return () => {
      active = false;
    };
  }, [currentDate]);

  const handlePrevDay = () => setCurrentDate(prev => subDays(prev, 1));
  const handleNextDay = () => setCurrentDate(prev => addDays(prev, 1));

  const handleNodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Set visibility from selected state
    formData.set("visibility", selectedVisibility);
    
    // Safely remove the empty image buffer from formData if it has no size
    // to prevent validation issues on the FastAPI backend
    const imageFile = formData.get("image") as File;
    const hasImage = imageFile && imageFile.size > 0;
    if (!hasImage && formData.has("image")) {
       formData.delete("image");
    }
    
    // Set type explicitly from selected state, ensuring it is a valid database enum
    formData.set("type", selectedType);

    try {
      await createNode(formData);
      setIsModalOpen(false);
      setSelectedType("custom"); // Reset selected type
      setSelectedVisibility("solo"); // Reset visibility
      
      // Reload current date nodes and update cache
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const data = await fetchNodes(dateStr);
      cacheRef.current[dateStr] = data; // Update cache safely
      setNodes(data);
    } catch (err) {
      console.error(err);
    }
    setFormSubmitting(false);
  };

  const isToday = format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  // Helper function to group reactions by type
  const getReactionCounts = (reactions?: NodeData["reactions"], currentUserId?: string | null): Record<ReactionType, { count: number; users: string[]; hasReacted: boolean }> => {
    const counts: Record<ReactionType, { count: number; users: string[]; hasReacted: boolean }> = {
      heart: { count: 0, users: [], hasReacted: false },
      thumbs_up: { count: 0, users: [], hasReacted: false },
      thumbs_down: { count: 0, users: [], hasReacted: false },
      fire: { count: 0, users: [], hasReacted: false },
    };

    if (!reactions) return counts;

    reactions.forEach(reaction => {
      const type = reaction.type as ReactionType;
      if (counts[type]) {
        counts[type].count++;
        counts[type].users.push(reaction.display_name);
        if (currentUserId && reaction.user_id === currentUserId) {
          counts[type].hasReacted = true;
        }
      }
    });

    return counts;
  };

  const handleShowPicker = (nodeId: string) => {
    if (pickerTimeoutRef.current) {
      clearTimeout(pickerTimeoutRef.current);
      pickerTimeoutRef.current = null;
    }
    setHoveredPickerNodeId(nodeId);
  };

  const handleHidePicker = () => {
    if (pickerTimeoutRef.current) {
      clearTimeout(pickerTimeoutRef.current);
    }
    pickerTimeoutRef.current = setTimeout(() => {
      setHoveredPickerNodeId(null);
    }, 500); // Reduced from 1000ms to 500ms
  };

  // Handle reaction click
  const handleReaction = async (nodeId: string, reactionType: ReactionType) => {
    try {
      // Play instant local nudge animation for snappy feedback
      setNudgingReaction({ nodeId, type: reactionType });
      setTimeout(() => setNudgingReaction(null), 350);

      // Perform optimistic state update instantly on UI
      const updatedNodes = nodes.map(node => {
        if (node.id !== nodeId) return node;

        const existingReactions = node.reactions || [];
        const userExistingReaction = existingReactions.find(r => r.user_id === userId);
        
        let newReactions = [...existingReactions];

        if (userExistingReaction) {
          if (userExistingReaction.type === reactionType) {
            // Remove reaction
            newReactions = newReactions.filter(r => r.user_id !== userId);
          } else {
            // Update reaction type
            newReactions = newReactions.map(r => 
              r.user_id === userId 
                ? { ...r, type: reactionType }
                : r
            );
          }
        } else {
          // Add new reaction
          newReactions.push({
            type: reactionType,
            user_id: userId || "",
            display_name: "You"
          });
        }

        return { ...node, reactions: newReactions };
      });

      setNodes(updatedNodes);
      const dateStr = format(currentDate, "yyyy-MM-dd");
      cacheRef.current[dateStr] = updatedNodes;

      // Close the picker popup on click
      setHoveredPickerNodeId(null);

      // Send the background network request
      reactToNode(nodeId, reactionType).then(async () => {
        // Fetch fresh nodes quietly in the background to ensure absolute sync
        const syncedData = await fetchNodes(dateStr);
        cacheRef.current[dateStr] = syncedData;
        setNodes(syncedData);
      }).catch(err => {
        console.error("Failed to sync reaction with backend:", err);
      });
      
    } catch (err) {
      console.error("Error reacting to node:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6 flex-1">
      {/* Date Navigation */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-100 rounded-lg">
        <button className="text-lg text-neutral-600 px-2 py-1 hover:bg-neutral-200 rounded disabled:opacity-30 disabled:cursor-not-allowed" onClick={handlePrevDay}>&larr;</button>
        <span className="text-sm font-medium text-neutral-800">
          {isToday ? "Today" : format(currentDate, "MMMM d, yyyy")}
        </span>
        <button className="text-lg text-neutral-600 px-2 py-1 hover:bg-neutral-200 rounded disabled:opacity-30 disabled:cursor-not-allowed" onClick={handleNextDay} disabled={isToday}>
          &rarr;
        </button>
      </div>

      {loading ? (
        <div className="flex-1 border border-dashed border-neutral-200 flex items-center justify-center min-h-[260px]">
          <p className="text-sm text-neutral-400 tracking-wide animate-pulse">Loading...</p>
        </div>
      ) : nodes.length === 0 ? (
        isToday ? (
          <div className="flex-1 bg-gradient-to-br from-neutral-50 to-neutral-100/50 border border-neutral-200/60 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[320px] shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
            {/* Subtle premium background glow */}
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-neutral-200/40 rounded-full blur-3xl group-hover:bg-neutral-300/40 transition-colors duration-500"></div>
            <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-neutral-200/30 rounded-full blur-3xl group-hover:bg-neutral-300/30 transition-colors duration-500"></div>
            
            <div className="flex flex-col items-center gap-5 text-center relative z-10 max-w-[360px]">
              {/* Elegant Premium Icon/Graphic */}
              <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-neutral-200/50 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform duration-300">
                <span className="text-xl font-light text-neutral-400 group-hover:text-neutral-600 transition-colors duration-300">✦</span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-medium tracking-tight text-neutral-800">Your space is clean and ready.</h2>
                <p className="text-xs text-neutral-500/90 leading-relaxed font-light">
                  Capture your thoughts, milestones, or ideas. Begin logging your day to preserve your daily progress.
                </p>
              </div>
              
              <button 
                className="mt-2 px-5 py-2.5 bg-neutral-900 text-white text-xs font-medium tracking-wider uppercase border border-neutral-900 rounded-lg shadow-sm transition-all duration-200 hover:bg-neutral-800 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                onClick={() => setIsModalOpen(true)}
              >
                + Start Logging
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 border border-dashed border-neutral-200 rounded-2xl flex items-center justify-center min-h-[320px] p-8 bg-neutral-50/50">
            <div className="flex flex-col items-center gap-3 text-center max-w-[280px]">
              <span className="text-lg font-light text-neutral-300">◇</span>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-neutral-600">No logs on this day</h3>
                <p className="text-xs text-neutral-400 leading-normal font-light">You did not record any nodes for this date.</p>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {nodes.map(node => {
            const reactionCounts = getReactionCounts(node.reactions, userId);
            const activeReactions = (Object.keys(REACTION_EMOJIS) as ReactionType[]).filter(
              type => reactionCounts[type].count > 0
            );
            const hasAnyReactions = activeReactions.length > 0;
            const isShared = node.visibility === "shared";
            
            return (
            <div key={node.id} className="border border-neutral-200/60 rounded-xl overflow-hidden bg-white relative flex flex-col cursor-pointer group min-h-[140px] shadow-sm hover:shadow-md hover:border-neutral-300/80 transition-all duration-300">
              
              {/* Category Badge */}
              {node.type && CATEGORY_STYLES[node.type] && (
                <div className={`absolute top-3 right-3 z-20 px-2 py-0.5 rounded-full text-[9px] font-semibold border flex items-center gap-1 ${CATEGORY_STYLES[node.type].bg} ${CATEGORY_STYLES[node.type].text} ${CATEGORY_STYLES[node.type].border}`}>
                  <span>{CATEGORY_STYLES[node.type].icon}</span>
                  <span>{CATEGORY_STYLES[node.type].label}</span>
                </div>
              )}

              {/* Reaction Bar - Only for shared nodes */}
              {isShared && (
                <div 
                  className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Active Reactions or Trigger Button */}
                  <div 
                    className="relative"
                    onMouseEnter={() => handleShowPicker(node.id)}
                    onMouseLeave={handleHidePicker}
                  >
                    {hasAnyReactions ? (
                      /* Active Reactions Row - Hovering it triggers picker */
                      <div className="flex items-center gap-1 bg-neutral-100/90 backdrop-blur-md px-1.5 py-1 rounded-full border border-neutral-200/50 shadow-xs cursor-pointer">
                        {activeReactions.map(reactionType => {
                          const { count, users, hasReacted } = reactionCounts[reactionType];
                          const isNudging = nudgingReaction?.nodeId === node.id && nudgingReaction?.type === reactionType;

                          return (
                            <div
                              key={reactionType}
                              className="relative"
                              onMouseEnter={() => setHoveredReaction({ nodeId: node.id, type: reactionType })}
                              onMouseLeave={() => setHoveredReaction(null)}
                            >
                              <button
                                onClick={() => handleReaction(node.id, reactionType)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold select-none transition-all duration-200 ${
                                  isNudging ? "animate-nudge" : ""
                                } ${
                                  hasReacted
                                    ? "bg-neutral-900 text-white shadow-xs border border-neutral-900 scale-102 hover:bg-neutral-800"
                                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300"
                                }`}
                              >
                                <span className="text-xs">{REACTION_EMOJIS[reactionType]}</span>
                                <span className="text-[10px] min-w-[10px] text-center">{count}</span>
                              </button>

                              {/* Tooltip showing who reacted */}
                              {hoveredReaction?.nodeId === node.id && hoveredReaction?.type === reactionType && (
                                <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 px-2 py-1 bg-neutral-950/95 text-white text-[9px] font-medium rounded-md shadow-lg whitespace-nowrap pointer-events-none z-50 animate-[nudge_0.15s_ease-out]">
                                  <div className="flex flex-col gap-0.5 text-center">
                                    {users.slice(0, 5).map((user: string, idx: number) => (
                                      <span key={idx} className="font-light">{user} {user === node.profiles?.display_name ? "(Author)" : ""}</span>
                                    ))}
                                    {users.length > 5 && (
                                      <span className="font-light text-neutral-400">+{users.length - 5} more</span>
                                    )}
                                  </div>
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-neutral-950"></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Trigger Button (☺+) - Shown only on hover when no reactions */
                      <button
                        className="flex items-center justify-center w-7 h-7 rounded-full bg-white/95 border border-neutral-200 shadow-sm text-neutral-500 hover:text-neutral-900 transition-all select-none hover:scale-105 hover:bg-neutral-50 active:scale-95 opacity-0 group-hover:opacity-100"
                        title="Add reaction"
                      >
                        <span className="text-[11px] font-medium">☺+</span>
                      </button>
                    )}

                    {/* Elegant floating horizontal emoji picker popover */}
                    {hoveredPickerNodeId === node.id && (
                      <div 
                        className="absolute bottom-full right-0 mb-2 p-1.5 bg-white/95 backdrop-blur-md border border-neutral-200/80 rounded-full flex items-center gap-1.5 shadow-lg z-50 animate-[nudge_0.2s_ease-out]"
                        onMouseEnter={() => handleShowPicker(node.id)}
                        onMouseLeave={handleHidePicker}
                      >
                        {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map(reactionType => {
                          const { hasReacted } = reactionCounts[reactionType];
                          const isNudging = nudgingReaction?.nodeId === node.id && nudgingReaction?.type === reactionType;
                          
                          return (
                            <button
                              key={reactionType}
                              onClick={() => handleReaction(node.id, reactionType)}
                              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-125 cursor-pointer select-none active:scale-90 ${
                                isNudging ? "animate-nudge" : ""
                              } ${
                                hasReacted 
                                  ? "bg-neutral-100 border border-neutral-300 shadow-xs" 
                                  : "hover:bg-neutral-100"
                              }`}
                              title={reactionType.replace("_", " ")}
                            >
                              <span className="text-base leading-none">{REACTION_EMOJIS[reactionType]}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {node.image_url ? (
                <div className="relative w-full h-[200px]">
                  {/* Render signed URL from backend, fallback to prepending API URL if missing */}
                  <img src={node.image_signed_url || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/${node.image_url}`} alt="node" className="w-full h-full object-cover" />
                  
                  {/* Creator name - bottom left, dynamically sized based on reaction space */}
                  {node.profiles && (
                    <div 
                      className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] text-white/90 border border-white/10 shadow-sm transition-all duration-300"
                      style={{
                        maxWidth: hasAnyReactions 
                          ? `calc(100% - ${(activeReactions.length * 48) + 40}px)` // Adjust based on exact active reaction pills width
                          : 'calc(100% - 50px)' // Default max width when no reactions (trigger is ~28px)
                      }}
                    >
                      {node.profiles.avatar_url ? (
                        <img src={node.profiles.avatar_url} alt={node.profiles.display_name} className="w-3.5 h-3.5 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-neutral-600 flex items-center justify-center text-[7px] font-semibold text-white/90 flex-shrink-0">
                          {node.profiles.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-light tracking-wide truncate">{node.profiles.display_name}</span>
                    </div>
                  )}

                  {node.content && (
                    <div className="absolute inset-0 bg-black/85 text-white p-4 flex items-center justify-center text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-sm z-30">
                      <p>{node.content}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 relative h-full flex flex-col justify-between items-center min-h-[140px] w-full text-center">
                    <div className="flex-1 flex items-center justify-center py-2">
                        <h3 className="text-base font-medium text-neutral-800 m-0">{node.title}</h3>
                    </div>
                    
                    {/* Creator name - bottom left for text-only nodes, dynamically sized */}
                    {node.profiles && (
                      <div 
                        className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-full text-[10px] text-neutral-600 border border-neutral-200/50 shadow-sm transition-all duration-300"
                        style={{
                          maxWidth: hasAnyReactions 
                            ? `calc(100% - ${(activeReactions.length * 48) + 40}px)` 
                            : 'calc(100% - 50px)'
                        }}
                      >
                        {node.profiles.avatar_url ? (
                          <img src={node.profiles.avatar_url} alt={node.profiles.display_name} className="w-3.5 h-3.5 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full bg-neutral-200 flex items-center justify-center text-[7px] font-bold text-neutral-500 flex-shrink-0">
                            {node.profiles.display_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-light tracking-wide truncate">{node.profiles.display_name}</span>
                      </div>
                    )}
                    {node.content && (
                      <div className="absolute inset-0 bg-black/85 text-white p-4 flex items-center justify-center text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-sm z-30">
                        <p>{node.content}</p>
                      </div>
                    )}
                </div>
              )}
            </div>
          )})}
        </div>
      )}

      {/* Add node CTA */}
      {nodes.length > 0 && (
        <div className="flex">
            <button className="px-5 py-2.5 bg-neutral-900 text-white text-sm tracking-wide border border-neutral-900 rounded-md transition-colors duration-150 hover:bg-neutral-800" onClick={() => setIsModalOpen(true)}>
              + add node
            </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => { setIsModalOpen(false); setSelectedType("custom"); }}>
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-[400px]" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleNodeSubmit} className="flex flex-col gap-4">
              <h3 className="m-0 text-lg font-medium text-neutral-900">Create Node</h3>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-600">Title</label>
                <input className="p-2 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500" name="title" type="text" placeholder="Title (optional)" />
              </div>

              {/* Gorgeous Pill Category Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-neutral-600 font-medium">Category</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "custom", label: "Custom", icon: "✦" },
                    { id: "workout", label: "Workout", icon: "⚡" },
                    { id: "food", label: "Food", icon: "🍏" },
                    { id: "mood", label: "Mood", icon: "✿" },
                    { id: "study", label: "Study", icon: "📖" },
                    { id: "social", label: "Social", icon: "👥" }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedType(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        selectedType === cat.id
                          ? "bg-neutral-900 border-neutral-900 text-white shadow-sm scale-[1.02]"
                          : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility Toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-neutral-600 font-medium">Visibility</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVisibility("solo")}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                      selectedVisibility === "solo"
                        ? "bg-neutral-900 border-neutral-900 text-white shadow-sm"
                        : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <span>🔒</span>
                    <span>Solo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedVisibility("shared")}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                      selectedVisibility === "shared"
                        ? "bg-neutral-900 border-neutral-900 text-white shadow-sm"
                        : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <span>👥</span>
                    <span>Shared</span>
                  </button>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {selectedVisibility === "solo" 
                    ? "Only you can see this node" 
                    : "Visible to your group members"}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-600">Image</label>
                <input className="p-2 border border-neutral-300 rounded-md file:bg-neutral-100 file:border-0 file:rounded file:px-2 file:py-1 file:mr-2 file:cursor-pointer hover:file:bg-neutral-200" name="image" type="file" accept="image/*" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-600">Description</label>
                <textarea className="p-2 border border-neutral-300 rounded-md min-h-[80px] resize-y focus:outline-none focus:border-neutral-500" name="content" placeholder="Description (optional)"></textarea>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 bg-transparent text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors" onClick={() => { setIsModalOpen(false); setSelectedType("custom"); setSelectedVisibility("solo"); }}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed" disabled={formSubmitting}>
                  {formSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
