"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../database/data-source");
const Sport_1 = require("../entities/Sport");
const Staff_1 = require("../entities/Staff");
const Team_1 = require("../entities/Team");
const TeamTrainingSchedule_1 = require("../entities/TeamTrainingSchedule");
const Field_1 = require("../entities/Field");
const TeamEnums_1 = require("../constants/TeamEnums");
async function seed() {
    await data_source_1.AppDataSource.initialize();
    // Get creator staff
    const staff = await data_source_1.AppDataSource.getRepository(Staff_1.Staff).findOne({ where: {} });
    if (!staff) {
        console.error("No staff found to assign as creator!");
        await data_source_1.AppDataSource.destroy();
        return;
    }
    // Get a field if exists
    const field = await data_source_1.AppDataSource.getRepository(Field_1.Field).findOne({ where: {} });
    const sportsData = [
        {
            name_en: 'Football',
            name_ar: 'كرة القدم',
            description_en: 'Popular team sport played with a ball on grass.',
            description_ar: 'رياضة جماعية شهيرة تُلعب بالكرة على العشب.',
            price: 150,
            status: 'active',
            is_active: true,
            sport_image: 'https://res.cloudinary.com/dkjnugbsd/image/upload/v1/sports/football.jpg'
        },
        {
            name_en: 'Basketball',
            name_ar: 'كرة السلة',
            description_en: 'Team sport played on a court with hoops.',
            description_ar: 'رياضة جماعية تُلعب في ملعب بوجود سلال.',
            price: 180,
            status: 'active',
            is_active: true,
            sport_image: 'https://res.cloudinary.com/dkjnugbsd/image/upload/v1/sports/basketball.jpg'
        },
        {
            name_en: 'Tennis',
            name_ar: 'التنس',
            description_en: 'Individual or doubles racket sport.',
            description_ar: 'رياضة فردية أو زوجية باستخدام المضارب.',
            price: 250,
            status: 'active',
            is_active: true,
            sport_image: 'https://res.cloudinary.com/dkjnugbsd/image/upload/v1/sports/tennis.jpg'
        }
    ];
    const sportRepo = data_source_1.AppDataSource.getRepository(Sport_1.Sport);
    const teamRepo = data_source_1.AppDataSource.getRepository(Team_1.Team);
    const scheduleRepo = data_source_1.AppDataSource.getRepository(TeamTrainingSchedule_1.TeamTrainingSchedule);
    for (const s of sportsData) {
        let sport = await sportRepo.findOne({ where: { name_en: s.name_en } });
        if (!sport) {
            sport = sportRepo.create({
                ...s,
                created_by_staff_id: staff.id
            });
            await sportRepo.save(sport);
            console.log(`✅ Created sport: ${s.name_en}`);
            // Create a default team for this sport
            const team = teamRepo.create({
                sport_id: sport.id,
                name_en: `${s.name_en} Main Team`,
                name_ar: `فريق ${s.name_ar} الأساسي`,
                max_participants: 20,
                status: TeamEnums_1.TeamStatus.ACTIVE,
                visibility_type: TeamEnums_1.TeamVisibilityType.BOTH,
                price: s.price,
                subscription_price: s.price,
            });
            await teamRepo.save(team);
            console.log(`✅ Created team for: ${s.name_en}`);
            // Create a training schedule
            const schedule = scheduleRepo.create({
                team_id: team.id,
                sport_id: sport.id,
                days_en: 'Mon, Wed, Fri',
                days_ar: 'الاثنين، الأربعاء، الجمعة',
                start_time: '18:00:00',
                end_time: '20:00:00',
                field_id: field?.id || null,
                training_fee: s.price,
                status: 'active'
            });
            await scheduleRepo.save(schedule);
            console.log(`✅ Created schedule for: ${s.name_en}`);
        }
    }
    console.log("Seeding finished!");
    await data_source_1.AppDataSource.destroy();
}
seed().catch(console.error);
//# sourceMappingURL=seed-sports.js.map