import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { postMessage, patchMarkRead } from "../services/chatService";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://campuscon-backend.vercel.app";

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setOnlineUsers([]);
      }
      return;
    }

    // Get the stored Firebase ID token and connect
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("online_users", (uids) => {
      setOnlineUsers(uids);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection notice:", err.message);
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user]);

  // ── sendMessage — Try Socket.IO first; fallback to HTTP REST (for Vercel serverless) ──
  const sendMessage = async (toUid, text) => {
    // If socket is connected, try real-time socket emit
    if (socketRef.current?.connected) {
      try {
        return await new Promise((resolve, reject) => {
          socketRef.current.emit("send_message", { toUid, text }, (response) => {
            if (response?.error) reject(new Error(response.error));
            else resolve(response);
          });
        });
      } catch (err) {
        console.warn("[Socket] Real-time send failed, falling back to HTTP:", err);
      }
    }

    // HTTP fallback: works everywhere, including Vercel serverless deployments!
    const res = await postMessage(toUid, text);
    return res.data;
  };

  // ── markRead — notify server via Socket & HTTP ───────────────────────────────
  const markRead = (convId, friendUid) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("mark_read", { convId, friendUid });
    }
    // Also patch via HTTP so database updates even on Vercel
    if (convId) {
      patchMarkRead(convId, friendUid).catch(() => {});
    }
  };

  // ── typing indicators ────────────────────────────────────────────────────────
  const emitTyping = (toUid) => {
    socketRef.current?.emit("typing", { toUid });
  };

  const emitStopTyping = (toUid) => {
    socketRef.current?.emit("stop_typing", { toUid });
  };

  // ── subscribe / unsubscribe to socket events ─────────────────────────────────
  const on = (event, handler) => {
    socketRef.current?.on(event, handler);
  };

  const off = (event, handler) => {
    socketRef.current?.off(event, handler);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        onlineUsers,
        sendMessage,
        markRead,
        emitTyping,
        emitStopTyping,
        on,
        off,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
