const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Serve the main index.html file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Manage users
const users = new Set();

io.on("connection", (socket) => {
    console.log("New user connected");

    // Handle new user joining
    socket.on("new_user_join", (user_name) => {
        users.add(user_name);
        socket.user_name = user_name;

        // Notify all users
        io.emit("users_join", user_name);
        io.emit("list_of_user", Array.from(users));
    });

    // Handle incoming messages from users
    socket.on("send_message", (message) => {
        const data = { user: socket.user_name, message: message };
        console.log(data);
        // Broadcast the message to all online users
        io.emit("receive_message", data);
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected");
        if (socket.user_name) {
            users.delete(socket.user_name);
            io.emit("userLeft", socket.user_name);
            io.emit("list_of_user", Array.from(users));
        }
    });
});

const Port = 3000;
server.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
});
