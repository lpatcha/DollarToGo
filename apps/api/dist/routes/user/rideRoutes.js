"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rideController_1 = require("../../controllers/user/rideController");
const authMiddleware_1 = require("../../middleware/auth/authMiddleware");
const router = (0, express_1.Router)();
// Protect all ride routes
router.use(authMiddleware_1.authenticate);
// Shared endpoints
router.get('/history', (0, authMiddleware_1.requireRole)(['USER', 'DRIVER', 'ADMIN']), rideController_1.getRideHistory);
router.get('/:id', (0, authMiddleware_1.requireRole)(['USER', 'DRIVER', 'ADMIN']), rideController_1.getRideDetails);
// User-exclusive endpoints
router.use((0, authMiddleware_1.requireRole)(['USER', 'ADMIN']));
// Standard Rider endpoints
router.post('/', rideController_1.createRide);
router.get('/my', rideController_1.getMyRides);
// Interactive Rider-to-Driver endpoints
router.get('/:id/drivers', rideController_1.getAvailableDrivers);
router.put('/:id/pick-driver', rideController_1.pickDriver);
router.put('/:id/increase-price', rideController_1.increasePrice);
router.put('/:id/cancel', rideController_1.cancelRide);
exports.default = router;
