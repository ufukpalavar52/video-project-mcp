import {
  BeforeInsert,
  BeforeUpdate,
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

  @Column({ type: 'int' })
  retryCount: number;

  @CreateDateColumn({
    type: 'timestamp',
  })
  public createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  public updatedAt: Date;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }
}
