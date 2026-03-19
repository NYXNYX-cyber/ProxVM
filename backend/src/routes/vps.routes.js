"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vps_controller_1 = require("../controllers/vps.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
router.get('/nodes', vps_controller_1.getNodes);
router.get('/instances', vps_controller_1.getUserInstances);
router.get('/:id/status', vps_controller_1.getInstanceStatus);
router.get('/:id/console', vps_controller_1.getInstanceConsole);
router.delete('/:id', vps_controller_1.deleteInstance);
router.post('/:id/destroy', vps_controller_1.destroyInstance);
router.post('/create', vps_controller_1.createInstance);
router.post('/:id/start', vps_controller_1.startInstance);
router.post('/:id/stop', vps_controller_1.stopInstance);
exports.default = router;
//# sourceMappingURL=vps.routes.js.map