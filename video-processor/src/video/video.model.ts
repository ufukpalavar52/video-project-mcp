import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transactionId: string;

  @Column()
  path: string;

  @Column('varchar', { length: 255, nullable: true })
  outputPath: string;

  @Column('varchar', { length: 20, nullable: true })
  resolution: string;

  @Column('varchar', { length: 20 })
  processType: string;

  @Column()
  isUrl: boolean;

  @Column({ type: 'int' })
  startTime: number;

  @Column({ type: 'int' })
  endTime: number;

  @Column('varchar', { length: 20 })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
