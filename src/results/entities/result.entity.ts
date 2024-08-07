import { Lot } from 'src/lots/entities/lot.entity';
import { Participant } from 'src/participants/entities/participant.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('results')
export class Result {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_number', type: 'integer', nullable: true })
  orderNumber: number;

  @Index()
  @Column({ name: 'group', type: 'integer' })
  group: number;

  @Index()
  @Column({ name: 'draw_type', type: 'varchar', length: 50 })
  drawType: string;

  @Column({ name: 'result_type', type: 'varchar', length: 50 })
  resultType: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => Participant, (participant: Participant) => participant.result)
  @JoinColumn({ name: 'participant_id' })
  participant: Participant;

  @OneToOne(() => Lot, (lot: Lot) => lot.result, { nullable: true })
  @JoinColumn({ name: 'lot_id' })
  lot?: Lot;
}
