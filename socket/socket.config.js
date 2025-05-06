const model = require("../models/index");
const { ApiError } = require("../utils/api.error");
const { StatusCodes } = require("http-status-codes");
const { validateToken } = require("../utils/jwt");
const {
  CONNECTED_EVENT,
  DISCONNECTED_EVENT,
  SOCKET_ERROR_EVENT,
  NEW_PRODUCT_ADDED,
  PRODUCT_DELETED,
} = require("../enums/socket-events");

const intializeSocketIo = (io) => {
  try {
    io.on("connection", async (socket) => {
      const authorization = socket?.handshake?.auth ?? {};

      if (!authorization.tokens) {
        throw new ApiError(401, "Un-authentication failed, Token is invalid", []);
      }

      let authDecodedToken = validateToken(
        authorization.tokens.access_token,
        process.env.ACCESS_TOKEN_SECRET
      );

      let dToken = authDecodedToken;

      const user = await model.UserModel.findById(dToken?._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
      );

      if (!user) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "Un-authorized handshake, Token is invalid",
          []
        );
      }

      socket.user = user;
      socket.join(user?._id?.toString());
      socket.emit(CONNECTED_EVENT);

      // **Assign User to Role-Based Rooms**
      if (["ADMIN", "SUB_ADMIN"].includes(user.role)) {
        socket.join("admin"); // Admins join the 'admin' room
      } else {
        socket.join("users"); // Regular users join the 'users' room
      }

      onNewProductAdded(socket);
      onProductDeleted(socket);

      console.log(`connected :  ${socket.user?._id}`);

      socket.on(DISCONNECTED_EVENT, () => {
        if (socket?.user?._id) {
          socket.leave(socket?.user?._id);
        }

        socket.leave(["ADMIN", "SUB_ADMIN"].includes(user.role) ? "admin" : "users");
      });
    });
  } catch (error) {
    socket.emit(
      SOCKET_ERROR_EVENT,
      error?.message || "Something went wrong while connecting to the sockets"
    );
  }
};

const onNewProductAdded = (socket) => {
  socket.on(NEW_PRODUCT_ADDED, (data) => {
    console.log(data);

    socket.to("users").emit(NEW_PRODUCT_ADDED, data);
  });
};

const onProductDeleted = (socket) => {
  socket.on(PRODUCT_DELETED, (data) => {
    console.log(data);

    socket.to("admin").emit(PRODUCT_DELETED, data);
  });
};

const emitSocketEventToUser = (req, event, payload) => {
  const io = req.app.get("io");

  return io.to("users").emit(event, payload);
};

const emitSocketEventToAdmin = (req, event, payload) => {
  const io = req.app.get("io");

  return io.to("admin").emit(event, payload);
};

module.exports = { intializeSocketIo, emitSocketEventToUser, emitSocketEventToAdmin };
