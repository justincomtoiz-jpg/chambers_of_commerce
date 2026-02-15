import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'streets' })
export class Street {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  code!: string;

  @Column()
  name!: string;
}
