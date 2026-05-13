import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Sport } from './Sport';
import { Branch } from './Branch';
import { Field } from './Field';
import { TeamTrainingSchedule } from './TeamTrainingSchedule';
import { TeamMemberTeam } from './TeamMemberTeam';
import { TeamVisibilityType, TeamStatus } from '../constants/TeamEnums';

@Entity('teams')
export class Team {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // ─── Sport ───────────────────────────────────────────────────────────────
    @Column({ type: 'integer' })
    sport_id: number;

    @ManyToOne(() => Sport, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sport_id' })
    sport: Sport;

    // ─── Branch ──────────────────────────────────────────────────────────────
    @Column({ type: 'integer', nullable: true })
    branch_id: number | null;

    @ManyToOne(() => Branch, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'branch_id' })
    branch: Branch | null;

    // ─── Field ───────────────────────────────────────────────────────────────
    /** The primary field used for this team's training sessions. */
    @Column({ type: 'uuid', nullable: true })
    field_id: string | null;

    @ManyToOne(() => Field, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'field_id' })
    field: Field | null;

    // ─── Bilingual Names ──────────────────────────────────────────────────────
    @Column({ type: 'varchar', length: 255 })
    name_en: string;

    @Column({ type: 'varchar', length: 255 })
    name_ar: string;

    // ─── Capacity ─────────────────────────────────────────────────────────────
    @Column({ type: 'integer', default: 20 })
    max_participants: number;

    // ─── Status ───────────────────────────────────────────────────────────────
    @Column({
        type: 'varchar',
        length: 50,
        default: TeamStatus.ACTIVE,
        enum: Object.values(TeamStatus),
    })
    status: TeamStatus;

    // ─── Visibility ───────────────────────────────────────────────────────────
    /**
     * Controls which member types can see and join this team.
     *   INTERNAL → working members, students, graduates, their dependents
     *   EXTERNAL → foreigners, visitor members, their dependents
     *   BOTH     → no restriction; any member type can join
     */
    @Column({
        type: 'varchar',
        length: 20,
        default: TeamVisibilityType.BOTH,
        enum: Object.values(TeamVisibilityType),
        comment: 'INTERNAL | EXTERNAL | BOTH',
    })
    visibility_type: TeamVisibilityType;

    // ─── Pricing ──────────────────────────────────────────────────────────────
    /**
     * Subscription price tied to visibility_type.
     * INTERNAL → price for internal users
     * EXTERNAL → price for external users
     * BOTH     → unified price for all users
     */
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number | null;

    /** Legacy column kept for backward compatibility */
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    subscription_price: number | null;

    // ─── Misc ─────────────────────────────────────────────────────────────────
    @Column({ type: 'boolean', default: false })
    approval_required: boolean;

    // ─── Timestamps ───────────────────────────────────────────────────────────
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ─── Relations ────────────────────────────────────────────────────────────
    @OneToMany(() => TeamTrainingSchedule, (schedule) => schedule.team)
    training_schedules: TeamTrainingSchedule[];

    @OneToMany(() => TeamMemberTeam, (teamMemberTeam) => teamMemberTeam.team)
    team_member_teams: TeamMemberTeam[];
}
