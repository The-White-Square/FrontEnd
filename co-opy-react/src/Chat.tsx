import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

const Chat = () => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null); // signalR connection
  const [messages, setMessages] = useState<{ user: string; message: string }[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false); //send button

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5054/chathub", /*API's port*/ {withCredentials: true})
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log("Connected to SignalR");
          setConnected(true);

          connection.on("ReceiveMessage", (user: string, message: string) => {
            setMessages((prev) => [...prev, { user, message }]);
          });
        })
        .catch((err) => console.error("Connection failed: ", err));
    }
  }, [connection]);

  const sendMessage = async () => {
    if (connection && input.trim() !== "") {
      try {
        await connection.invoke("SendMessage", "ReactUser", input);
        setInput("");
      } catch (err) {
        console.error("Send failed: ", err);
      }
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>SignalR Chat</h2>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} disabled={!connected}>
          {connected ? "Send" : "Connecting..."}
        </button>
      </div>
      <ul>
        {messages.map((m, i) => (
          <li key={i}>
            <b>{m.user}:</b> {m.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Chat;
