import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'businesses' })
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  sourcePreAppId!: string;

  @Column()
  name!: string;

  @Column()
  type!: 'Business' | 'Event' | 'Freelancer';

  @Column({ type: 'json' })
  data!: any;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate!: number;

  @Column({ nullable: true })
  expiry?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
