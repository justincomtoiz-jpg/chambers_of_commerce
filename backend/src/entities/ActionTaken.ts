import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'actions_taken' })
export class ActionTaken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  inspectionId!: string;

  @Column({ type: 'json' })
  inspectionSnapshot!: any;

  @Column()
  action!: string;

  @Column()
  performedBy!: string;

  @Column({ type: 'int' })
  performedByGrade!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
