import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../../database/entities/wallet.entity';
import { WalletTransaction } from '../../database/entities/wallet-transaction.entity';
import { WithdrawalRequest } from '../../database/entities/withdrawal-request.entity';
import { BankAccount } from '../../database/entities/bank-account.entity';
import { User } from '../../database/entities/user.entity';
import { WalletService } from './wallet.service';
import { AdminWalletController } from './wallet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletTransaction, WithdrawalRequest, BankAccount, User])],
  providers: [WalletService],
  controllers: [AdminWalletController],
  exports: [WalletService],
})
export class WalletModule {}