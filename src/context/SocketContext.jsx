import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

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
      console.error("[Socket] Connection error:", err.message);
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user]);

  // ── sendMessage — emit via socket, return a promise ─────────────────────────
  const sendMessage = (toUid, text) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        return reject(new Error("Socket not connected"));
      }
      socketRef.current.emit("send_message", { toUid, text }, (response) => {
        if (response?.error) reject(new Error(response.error));
        else resolve(response);
      });
    });
  };

  // ── markRead — notify server that messages are read ──────────────────────────
  const markRead = (convId, friendUid) => {
    socketRef.current?.emit("mark_read", { convId, friendUid });
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
