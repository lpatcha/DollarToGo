"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const driverController_1 = require("../../controllers/driver/driverController");
const authMiddleware_1 = require("../../middleware/auth/authMiddleware");
const router = (0, express_1.Router)();
// Protect all driver routes
router.use(authMiddleware_1.authenticate);
router.use((0, authMiddleware_1.requireRole)(['DRIVER', 'ADMIN']));
// Core Driver Actions
router.post('/enroll-zip', driverController_1.enrollZipCode);
router.post('/enroll-bulk-zips', driverController_1.enrollBulkZipCodes);
router.get('/assigned-requests', driverController_1.getAssignedRideRequests);
router.post('/requests/:id/accept', driverController_1.acceptRideRequest);
router.put('/rides/:id/cancel', driverController_1.driverCancelRide);
router.put('/rides/:id/complete', driverController_1.completeRide);
exports.default = router;
