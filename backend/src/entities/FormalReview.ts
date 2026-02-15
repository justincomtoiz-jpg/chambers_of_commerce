import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'formal_reviews' })
export class FormalReview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  preApplicationId!: string;

  @Column({ type: 'tinyint', nullable: true })
  meetsCityGoals?: 0 | 1 | null;

  @Column({ type: 'enum', enum: ['Yes', 'No', 'Possibly'], nullable: true })
  locationValid?: 'Yes' | 'No' | 'Possibly' | null;

  @Column({ nullable: true })
  mloLink?: string;

  @Column({ type: 'int', nullable: true })
  costEstimate?: number;

  @Column({ type: 'int', nullable: true })
  timeframeDays?: number;

  @Column({ type: 'tinyint', nullable: true })
  passedBackgroundCheck?: 0 | 1 | null;

  @Column({ default: 'Pending' })
  status!: 'Pending' | 'Completed' | 'SentBack';

  @Column({ nullable: true })
  reviewedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
