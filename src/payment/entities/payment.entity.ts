import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'payment_id' })
  paymentId: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: false })
  amount: number;

  @Column({ name: 'user_email', nullable: false })
  userEmail: string;

  @Column({ name: 'user_upi_id', nullable: false })
  userUpiId: string;

  @Column({ default: 'INR', nullable: false })
  currency: string;

  @Column({ name: 'merchant_id', nullable: false })
  merchantId: string;

  @Column({ nullable: false, default: 'initiated' })
  paymentStatus: string;

  @Column()
  upiIntentId: string;

  @Column()
  transactionId: string;
}
