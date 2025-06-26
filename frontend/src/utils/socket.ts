import { io } from "socket.io-client";

const apiUrl = "https://community-events-board.onrender.com/";
export const socket = io(apiUrl, {
  transports: ["websocket"],
});
socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server");
});
