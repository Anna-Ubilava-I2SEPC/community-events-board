import { io } from "socket.io-client";

const apiUrl = "https://main.d1r03isbgzcqje.amplifyapp.com/";
export const socket = io(apiUrl);
socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server");
});
