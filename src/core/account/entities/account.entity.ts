import { User } from "../../../core/user/entities/user.entity";
import { DecimalColumnToNumberTransformer } from "../../../shared/utils/column-transformer";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'decimal',
    default: 0,
    transformer: new DecimalColumnToNumberTransformer(),
  })
  balance: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
