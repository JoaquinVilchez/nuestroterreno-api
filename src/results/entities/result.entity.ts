import { Participant } from '../..//participants/entities/participant.entity';
import { Lot } from '../../lots/entities/lot.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @Column({ name: 'group', type: 'integer' })
  group: number;

  @Column({ name: 'draw_type', type: 'varchar', length: 100 })
  drawType: string;

  @Column({ name: 'result_type', type: 'varchar' })
  resultType: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  @OneToOne(() => Lot, (lot: Lot) => lot.result, {
    cascade: false,
    nullable: true,
  })
  @JoinColumn({ name: 'lot' })
  lot?: Lot;

  @ManyToOne(
    () => Participant,
    (participant: Participant) => participant.results,
    {
      cascade: false,
      nullable: false,
    },
  )
  @JoinColumn({ name: 'participant' })
  participant: Participant;
}
