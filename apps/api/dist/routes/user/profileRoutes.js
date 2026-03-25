"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController_1 = require("../../controllers/user/profileController");
const authMiddleware_1 = require("../../middleware/auth/authMiddleware");
const router = (0, express_1.Router)();
// Protect all profile routes
router.use(authMiddleware_1.authenticate);
router.get('/', profileController_1.getMe);
router.put('/', profileController_1.updateProfile);
router.post('/request-password-update', profileController_1.requestPasswordUpdate);
router.put('/password', profileController_1.updatePassword);
exports.default = router;
