import { Exclude, Expose } from 'class-transformer';
import { Account } from '../../../core/account/entities/account.entity';
import { Transfer } from '../../../core/transfer/entities/transfer.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  username: string;

  @Exclude()
  @Column({ type: 'varchar' })
  password: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => Account, (account) => account.user, { cascade: true })
  account: Account;

  @OneToMany(() => Transfer, (transfer) => transfer.sender)
  sentTransfers: Transfer[];

  @OneToMany(() => Transfer, (transfer) => transfer.receiver)
  receivedTransfers: Transfer[];
}
