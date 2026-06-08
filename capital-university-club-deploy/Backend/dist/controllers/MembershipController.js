"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipController = void 0;
const data_source_1 = require("../database/data-source");
const MembershipPlan_1 = require("../entities/MembershipPlan");
class MembershipController {
    static async getAllPlans(req, res) {
        try {
            const plans = await MembershipController.membershipRepo.find({
                order: { price: 'ASC' }
            });
            return res.json(plans);
        }
        catch (error) {
            console.error('Error fetching membership plans:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async getPlan(req, res) {
        try {
            const { id } = req.params;
            const plan = await MembershipController.membershipRepo.findOne({
                where: { id: parseInt(id) }
            });
            if (!plan) {
                return res.status(404).json({ message: 'Membership plan not found' });
            }
            return res.json(plan);
        }
        catch (error) {
            console.error('Error fetching membership plan:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.MembershipController = MembershipController;
MembershipController.membershipRepo = data_source_1.AppDataSource.getRepository(MembershipPlan_1.MembershipPlan);
//# sourceMappingURL=MembershipController.js.map