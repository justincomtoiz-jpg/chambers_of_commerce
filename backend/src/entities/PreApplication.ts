import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PreAppStatus =
  | 'PendingReview'
  | 'FormalReview'
  | 'Quarantined'
  | 'Rejected'
  | 'BoardReview'
  | 'CommissionerReview';

@Entity({ name: 'pre_applications' })
export class PreApplication {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  requestorName!: string;

  @Column({ type: 'date' })
  dob!: string;

  @Column()
  businessName!: string;

  @Column()
  type!: 'Business' | 'Event' | 'Freelancer';

  @Column({ type: 'text' })
  description!: string;

  @Column()
  location!: string;

  @Column({ type: 'int' })
  budget!: number;

  @Column()
  category!:
    | 'Food'
    | 'Alcohol'
    | 'Entertainment'
    | 'Services'
    | 'Security'
    | 'Transportation';

  @Column({ default: 'PendingReview' })
  status!: PreAppStatus;

  @Column({ type: 'json', nullable: true })
  history?: any;

  @Column()
  createdBy!: string;

  @Column({ type: 'int' })
  createdByGrade!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
