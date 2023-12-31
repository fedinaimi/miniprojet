const mongoose = require("mongoose");

const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const messageRoutes = require("./routes/message");
const socket = require("socket.io");
require("dotenv").config();
const path = require('path');
const port = process.env.PORT || 5000;

//import route
const userRoutes = require("./routes/user");
const panierRoutes = require("./routes/panier");
const boutiqueRoutes = require("./routes/boutique");
const app = express();
app.use('/images', express.static(path.join(__dirname, 'images')));

mongoose
  .connect("mongodb://localhost:27017/miniprojet")
  .then(() => {
    console.log("Database connected!");
    // Starting a server
    app.listen(port, process.env.ALWAYSDATA_HTTP_ID, () => {
      console.log(`App is running at ${port}`);
    });
  })
  .catch((err) => console.log(err));

// for cors origin config
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
//use parsing middelware
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api", userRoutes);
app.use("/boutique",boutiqueRoutes)
app.use("/panier", panierRoutes);
app.use("/api/messages", messageRoutes);
const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:5000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});