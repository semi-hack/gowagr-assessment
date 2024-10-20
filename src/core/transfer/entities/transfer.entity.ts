import { User } from "src/core/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sentTransfers)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedTransfers)
  receiver: User;

  @Column({ type: 'varchar', unique: true })
  reference: string;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ type: 'decimal' })
  balanceBefore: number;

  @Column({ type: 'decimal' })
  balanceAfter: number; 

  @CreateDateColumn()
  createdAt: Date;
}