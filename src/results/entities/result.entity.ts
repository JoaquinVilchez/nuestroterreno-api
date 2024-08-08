import { Participant } from 'src/participants/entities/participant.entity';
import { Lot } from 'src/lots/entities/lot.entity';
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

  @Index()
  @Column({ name: 'group', type: 'integer' })
  group: number;

  @Index()
  @Column({ name: 'draw_type', type: 'varchar', length: 100 })
  drawType: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  @OneToOne(() => Lot, (lot: Lot) => lot.result, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'lot' })
  lot?: Lot;

  @OneToOne(
    () => Participant,
    (participant: Participant) => participant.result,
    {
      cascade: true,
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'participant' })
  participant?: Participant;
}
