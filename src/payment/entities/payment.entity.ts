import { BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';

export class PaymentEntity extends BaseEntity {
  constructor(partial?: Partial<PaymentEntity>) {
    super();
    Object.assign(this, partial);
  }

  @Column({ name: 'payment_id' })
  paymentId: string;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @Column({ nullable: false })
  amount: number;

  @Column({ name: 'scheme_id', nullable: false })
  schemeId: string;

  @Column({ default: 'INR', nullable: false })
  currency: string;

  @Column({ name: 'payment_status', default: 'initiated', nullable: false })
  paymentStatus: string;

  @Column({ name: 'transaction_id', unique: true, nullable: false })
  transactionId: string;
}
