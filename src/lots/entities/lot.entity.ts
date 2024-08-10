import { Result } from '../../results/entities/result.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('lots')
export class Lot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'group', type: 'integer' })
  group: number;

  @Column({ name: 'draw_type', type: 'varchar', length: 100 })
  drawType: string;

  @Column({ name: 'denomination', type: 'varchar', length: 100, unique: true })
  denomination: string;

  @Column({ name: 'image', type: 'varchar', default: 'no-image.jpg' })
  image: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  @OneToOne(() => Result, (result: Result) => result.lot, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  result?: Result;
}
