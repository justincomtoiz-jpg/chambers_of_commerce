import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'pd_requests' })
export class PDRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  requestedBy!: string;

  @Column()
  targetId!: string;

  @Column()
  targetType!: 'Business' | 'Event';

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ default: 'Pending' })
  status!: 'Pending' | 'Approved' | 'Denied' | 'Quarantined';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
