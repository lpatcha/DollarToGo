"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ratingController_1 = require("../../controllers/rating/ratingController");
const authMiddleware_1 = require("../../middleware/auth/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.use((0, authMiddleware_1.requireRole)(['USER', 'ADMIN']));
// Rate a completed ride
router.post('/', ratingController_1.rateRide);
exports.default = router;
