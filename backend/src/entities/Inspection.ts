import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'inspections' })
export class Inspection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  targetId!: string;

  @Column()
  targetType!: 'Business' | 'Event';

  @Column({
    type: 'enum',
    enum: ['For Cause', 'Random', 'Scheduled', 'PD Requested'],
  })
  justification!: 'For Cause' | 'Random' | 'Scheduled' | 'PD Requested';

  @Column({ type: 'text' })
  notes!: string;

  @Column({ default: 'Pending' })
  status!: 'Pending' | 'Quarantined' | 'Completed';

  @Column()
  inspectorId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
