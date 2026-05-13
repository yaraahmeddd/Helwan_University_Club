import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './Account';
import { StaffType } from './StaffType';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  account_id: number;

  @OneToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'integer' })
  staff_type_id: number;

  @ManyToOne(() => StaffType, (staffType) => staffType.staff_members)
  @JoinColumn({ name: 'staff_type_id' })
  staff_type: StaffType;

  @Column({ type: 'varchar', length: 100 })
  first_name_en: string;

  @Column({ type: 'varchar', length: 100 })
  first_name_ar: string;

  @Column({ type: 'varchar', length: 100 })
  last_name_en: string;

  @Column({ type: 'varchar', length: 100 })
  last_name_ar: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  national_id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'date' })
  employment_start_date: Date;

  @Column({ type: 'date', nullable: true })
  employment_end_date: Date | null;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string; // pending, active, inactive, suspended, on_leave

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // ─── Hiring Documents ───────────────────────────────────────────────────────

  /** Academic qualification certificate (original/copy) */
  @Column({ type: 'text', nullable: true })
  academic_certificate: string | null;

  /** National ID card — front side (valid) */
  @Column({ type: 'text', nullable: true })
  national_id_front: string | null;

  /** National ID card — back side (valid) */
  @Column({ type: 'text', nullable: true })
  national_id_back: string | null;

  /** Military service status document (males only; original/copy) */
  @Column({ type: 'text', nullable: true })
  military_service_doc: string | null;

  /** Criminal record certificate — original (for non-university employees) */
  @Column({ type: 'text', nullable: true })
  criminal_record: string | null;

  /** Employer approval letter */
  @Column({ type: 'text', nullable: true })
  employer_approval_letter: string | null;

  /** Employment status statement (for those working in other organisations) */
  @Column({ type: 'text', nullable: true })
  employment_status_statement: string | null;

  /** Good conduct certificate (for those NOT working in other organisations) */
  @Column({ type: 'text', nullable: true })
  good_conduct_certificate: string | null;

  /** Recent personal photo */
  @Column({ type: 'text', nullable: true })
  personal_photo: string | null;

  /** Completed personal-information (acquaintance) form */
  @Column({ type: 'text', nullable: true })
  personal_info_form: string | null;

  /** Experience certificates and training course copies (if available) */
  @Column({ type: 'text', nullable: true })
  experience_certificates: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Note: Privilege assignments are handled through:
  // 1. staff_packages table (for complete package assignments)
  // 2. staff_privileges_override table (for individual privilege grants/revokes)
  // This is NOT a direct ManyToMany relationship
}
