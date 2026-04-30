import { create } from "zustand";
import { useSocketStore } from "./useSocketStore";

export const useGameStore = create((set, get) => ({
    rooms: [],
    currentRoom: null,
    gameState: null, // 'waiting', 'playing', 'finished'
    phase: 'picking', // 'picking', 'answering'
    activeWord: null,
    players: [],
    currentTurn: 0,
    scores: {},
    lastResult: null,
    error: null,

    // Actions
    initListeners: (socket) => {
        if (!socket) return;
        
        socket.off("game_room_list");
        socket.off("game_room_updated");
        socket.off("game_started");
        socket.off("game_card_picked");
        socket.off("game_turn_update");
        socket.off("game_finished");
        socket.off("game_error");
        socket.off("game_player_left");

        socket.on("game_room_list", (rooms) => set({ rooms }));
        
        socket.on("game_room_updated", (room) => {
            set({ 
                currentRoom: room, 
                players: room.players, 
                gameState: room.status, 
                scores: room.scores,
                phase: room.phase || 'picking',
                activeWord: room.activeWord || null
            });
        });

        socket.on("game_started", ({ players, currentTurn, phase }) => {
            set({ players, currentTurn, phase, gameState: "playing", lastResult: null, activeWord: null });
        });

        socket.on("game_card_picked", ({ word, challengerId, phase }) => {
            set({ activeWord: word, phase, lastResult: null }); // Clear old feedback when new card picked
        });

        socket.on("game_turn_update", ({ scores, currentTurn, phase, lastResult, players }) => {
            set({ scores, currentTurn, phase, lastResult, players, activeWord: null });
            
            // Auto clear feedback after 3 seconds
            setTimeout(() => {
                set({ lastResult: null });
            }, 3000);
        });

        socket.on("game_finished", ({ scores, players }) => {
            set({ gameState: "finished", scores, players });
        });

        socket.on("game_error", (error) => {
            alert(error);
            set({ error });
        });

        socket.on("game_player_left", (socketId) => {
            set((state) => ({
                players: state.players.filter(p => p.socketId !== socketId),
                gameState: "waiting"
            }));
        });
    },

    clearListeners: () => {
        const { socket } = useSocketStore.getState();
        if (!socket) return;
        socket.off("game_room_list");
        socket.off("game_room_created");
        socket.off("game_room_updated");
        socket.off("game_started");
        socket.off("game_turn_update");
        socket.off("game_finished");
        socket.off("game_error");
        socket.off("game_player_left");
    },

    getRooms: () => {
        const { socket } = useSocketStore.getState();
        socket?.emit("game_get_rooms");
    },

    createRoom: (name, user, password) => {
        const { socket } = useSocketStore.getState();
        socket?.emit("game_create_room", { roomName: name, user, password });
    },

    joinRoom: (roomId, user, password) => {
        const { socket } = useSocketStore.getState();
        socket?.emit("game_join_room", { roomId, user, password });
    },

    pickCard: (roomId, wordId) => {
        const { socket } = useSocketStore.getState();
        socket?.emit("game_pick_card", { roomId, wordId });
    },

    submitAnswer: (roomId, answer) => {
        const { socket } = useSocketStore.getState();
        socket?.emit("game_submit_answer", { roomId, answer });
    },

    leaveRoom: (roomId) => {
        const { socket } = useSocketStore.getState();
        socket?.emit("game_leave_room", { roomId });
        set({ currentRoom: null, gameState: null, players: [], scores: {}, lastResult: null });
    }
}));
