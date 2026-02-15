import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'logs' })
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  entityType!: string;

  @Column()
  entityId!: string;

  @Column()
  action!: string;

  @Column()
  performedBy!: string;

  @Column({ type: 'int' })
  performedByGrade!: number;

  @Column({ type: 'json', nullable: true })
  details?: any;

  @CreateDateColumn()
  timestamp!: Date;
}
