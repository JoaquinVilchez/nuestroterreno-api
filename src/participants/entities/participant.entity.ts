import { Result } from '../..//results/entities/result.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ball_number', type: 'integer', unique: true })
  ballNumber: number;

  @Column({ name: 'first_name', type: 'varchar', length: 50 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 50 })
  lastName: string;

  @Column({ name: 'secondary_last_name', type: 'varchar', length: 50 })
  secondaryLastName: string;

  @Column({ name: 'dni', type: 'varchar', length: 8, unique: true })
  dni: string;

  @Column({ name: 'group', type: 'integer' })
  group: number;

  @Column({ name: 'type', type: 'varchar' })
  type: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  @OneToMany(() => Result, (result: Result) => result.participant, {
    onDelete: 'CASCADE',
  })
  results: Result[];
}
