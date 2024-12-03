const express = require("express");
const controllers = require("../../controllers/index.controller");
const { verifyJWT, checkPermissions } = require("../../middlewares/auth.middleware");
const { RoleEnums } = require("../../constants");

const router = express.Router();

router.use(verifyJWT);

router.route("/orders-stats").get(checkPermissions(RoleEnums.ADMIN, RoleEnums.MODERATOR));

module.exports = router;
