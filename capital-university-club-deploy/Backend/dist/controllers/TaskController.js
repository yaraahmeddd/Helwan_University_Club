"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const data_source_1 = require("../database/data-source");
const Task_1 = require("../entities/Task");
class TaskController {
    static async getAllTasks(req, res) {
        try {
            const tasks = await TaskController.taskRepo.find({
                order: { created_at: 'DESC' },
            });
            return res.json({ success: true, data: tasks });
        }
        catch (error) {
            console.error('Error fetching tasks:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
        }
    }
    static async createTask(req, res) {
        try {
            const { title, description, type, data, created_by } = req.body;
            const newTask = TaskController.taskRepo.create({
                title,
                description,
                type,
                data,
                created_by,
                status: Task_1.TaskStatus.PENDING,
            });
            await TaskController.taskRepo.save(newTask);
            return res.status(201).json({ success: true, message: 'Task created successfully', data: newTask });
        }
        catch (error) {
            console.error('Error creating task:', error);
            return res.status(500).json({ success: false, message: 'Failed to create task' });
        }
    }
    static async updateTaskStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!Object.values(Task_1.TaskStatus).includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }
            const task = await TaskController.taskRepo.findOne({ where: { id: parseInt(id) } });
            if (!task) {
                return res.status(404).json({ success: false, message: 'Task not found' });
            }
            task.status = status;
            await TaskController.taskRepo.save(task);
            return res.json({ success: true, message: `Task ${status} successfully`, data: task });
        }
        catch (error) {
            console.error('Error updating task:', error);
            return res.status(500).json({ success: false, message: 'Failed to update task' });
        }
    }
}
exports.TaskController = TaskController;
TaskController.taskRepo = data_source_1.AppDataSource.getRepository(Task_1.Task);
//# sourceMappingURL=TaskController.js.map