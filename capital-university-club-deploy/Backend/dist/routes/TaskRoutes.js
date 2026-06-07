"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TaskController_1 = require("../controllers/TaskController");
const router = (0, express_1.Router)();
// GET all tasks
router.get('/', (req, res) => TaskController_1.TaskController.getAllTasks(req, res));
// POST create task
router.post('/', (req, res) => TaskController_1.TaskController.createTask(req, res));
// PATCH update task status
router.patch('/:id/status', (req, res) => TaskController_1.TaskController.updateTaskStatus(req, res));
exports.default = router;
//# sourceMappingURL=TaskRoutes.js.map