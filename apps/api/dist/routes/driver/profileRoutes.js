"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController_1 = require("../../controllers/driver/profileController");
const authMiddleware_1 = require("../../middleware/auth/authMiddleware");
const router = (0, express_1.Router)();
// Protect all driver routes
router.use(authMiddleware_1.authenticate);
router.use((0, authMiddleware_1.requireRole)(['DRIVER', 'ADMIN']));
router.post('/enroll-zip', profileController_1.enrollZipCode);
router.put('/', profileController_1.updateDriverProfileAction);
exports.default = router;
