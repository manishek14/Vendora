import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../../database/entities/wallet.entity';
import { WalletTransaction, TransactionType, TransactionStatus } from '../../database/entities/wallet-transaction.entity';
import { WithdrawalRequest, WithdrawalStatus } from '../../database/entities/withdrawal-request.entity';
import { BankAccount } from '../../database/entities/bank-account.entity';
import { User } from '../../database/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { BankAccountDto } from './dto/bank-account.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private transactionRepo: Repository<WalletTransaction>,
    @InjectRepository(WithdrawalRequest)
    private withdrawalRepo: Repository<WithdrawalRequest>,
    @InjectRepository(BankAccount)
    private bankAccountRepo: Repository<BankAccount>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private configService: ConfigService,
  ) {}

  private async getOrCreateWallet(userId: number): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({ where: { user: { id: userId } } });
    if (!wallet) {
      wallet = this.walletRepo.create({ user: { id: userId }, balance: 0 });
      wallet = await this.walletRepo.save(wallet);
    }
    return wallet;
  }

  async getBalance(userId: number): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet.balance;
  }

  async deposit(userId: number, amount: number, gateway: 'zarinpal' | 'pasargad'): Promise<{ transactionId: number; redirectUrl: string }> {
    const wallet = await this.getOrCreateWallet(userId);
    const maxBalance = this.configService.get<number>('wallet.maxBalanceCustomer') || 200000000;
    if (wallet.balance + amount > maxBalance) {
      throw new BadRequestException(`موجودی کیف پول نمی‌تواند از ${maxBalance.toLocaleString()} تومان بیشتر شود`);
    }

    const transaction = this.transactionRepo.create({
      user: { id: userId },
      amount,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
    });
    await this.transactionRepo.save(transaction);

    const callbackUrl = `${process.env.BASE_URL}/wallet/deposit/callback?transactionId=${transaction.id}`;
    const redirectUrl = `https://payment.zarinpal.com/pg/StartPay/${transaction.id}`;

    return { transactionId: transaction.id, redirectUrl };
  }

  async verifyDeposit(transactionId: number, authority: string, status: string): Promise<boolean> {
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId },
      relations: ['user'],
    });
    if (!transaction) throw new NotFoundException('تراکنش یافت نشد');
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('تراکنش قبلاً تأیید شده است');
    }

    if (status === 'NOK') {
      transaction.status = TransactionStatus.FAILED;
      await this.transactionRepo.save(transaction);
      return false;
    }

    const success = true;
    if (success) {
      const wallet = await this.getOrCreateWallet(transaction.user.id);
      wallet.balance += transaction.amount;
      await this.walletRepo.save(wallet);
      transaction.status = TransactionStatus.COMPLETED;
      await this.transactionRepo.save(transaction);
      return true;
    } else {
      transaction.status = TransactionStatus.FAILED;
      await this.transactionRepo.save(transaction);
      return false;
    }
  }

  async deduct(userId: number, amount: number, referenceId: string): Promise<void> {
    const wallet = await this.getOrCreateWallet(userId);
    if (wallet.balance < amount) {
      throw new BadRequestException('موجودی کیف پول کافی نیست');
    }
    wallet.balance -= amount;
    await this.walletRepo.save(wallet);

    const transaction = this.transactionRepo.create({
      user: { id: userId },
      amount: -amount,
      type: TransactionType.PURCHASE,
      status: TransactionStatus.COMPLETED,
      referenceId,
    });
    await this.transactionRepo.save(transaction);
  }

  async credit(userId: number, amount: number, referenceId: string, type: TransactionType): Promise<void> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.balance += amount;
    await this.walletRepo.save(wallet);

    const transaction = this.transactionRepo.create({
      user: { id: userId },
      amount,
      type,
      status: TransactionStatus.COMPLETED,
      referenceId,
    });
    await this.transactionRepo.save(transaction);
  }

  async getTransactions(userId: number, limit = 20, offset = 0): Promise<WalletTransaction[]> {
    return this.transactionRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async requestWithdrawal(vendorId: number, amount: number, bankAccountId: number): Promise<WithdrawalRequest> {
    const wallet = await this.getOrCreateWallet(vendorId);
    if (wallet.balance < amount) {
      throw new BadRequestException('موجودی کیف پول کافی نیست');
    }

    const threshold = this.configService.get<number>('wallet.withdrawalFeeThreshold') || 1000000000;
    const lowFee = this.configService.get<number>('wallet.withdrawalFeeLow') || 20;
    const highFee = this.configService.get<number>('wallet.withdrawalFeeHigh') || 10;
    const feePercent = amount < threshold ? lowFee : highFee;
    const feeAmount = Math.floor(amount * feePercent / 100);
    const netAmount = amount - feeAmount;

    const pendingRequest = await this.withdrawalRepo.findOne({
      where: { vendor: { id: vendorId }, status: WithdrawalStatus.PENDING },
    });
    if (pendingRequest) {
      throw new BadRequestException('شما یک درخواست برداشت در انتظار تأیید دارید');
    }

    const request = this.withdrawalRepo.create({
      vendor: { id: vendorId },
      amount,
      feePercent,
      feeAmount,
      netAmount,
      bankAccountId,
      status: WithdrawalStatus.PENDING,
    });
    return this.withdrawalRepo.save(request);
  }

  async cancelWithdrawal(requestId: number, vendorId: number): Promise<void> {
    const request = await this.withdrawalRepo.findOne({
      where: { id: requestId, vendor: { id: vendorId } },
    });
    if (!request) throw new NotFoundException('درخواست یافت نشد');
    if (request.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('فقط درخواست‌های در انتظار تأیید قابل لغو هستند');
    }
    request.status = WithdrawalStatus.CANCELLED;
    await this.withdrawalRepo.save(request);
  }

  async getWithdrawals(vendorId: number): Promise<WithdrawalRequest[]> {
    return this.withdrawalRepo.find({
      where: { vendor: { id: vendorId } },
      order: { requestedAt: 'DESC' },
    });
  }

  async getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
    return this.withdrawalRepo.find({
      where: { status: WithdrawalStatus.PENDING },
      relations: ['vendor'],
    });
  }

  async approveWithdrawal(requestId: number, adminId: number): Promise<void> {
    const request = await this.withdrawalRepo.findOne({
      where: { id: requestId },
      relations: ['vendor'],
    });
    if (!request) throw new NotFoundException('درخواست یافت نشد');
    if (request.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('درخواست قبلاً پردازش شده است');
    }

    const success = true;
    if (success) {
      const wallet = await this.getOrCreateWallet(request.vendor.id);
      if (wallet.balance < request.amount) {
        throw new BadRequestException('موجودی کیف پول کافی نیست');
      }
      wallet.balance -= request.amount;
      await this.walletRepo.save(wallet);

      request.status = WithdrawalStatus.PAID;
      request.processedBy = adminId;
      request.processedAt = new Date();
      await this.withdrawalRepo.save(request);

      const transaction = this.transactionRepo.create({
        user: { id: request.vendor.id },
        amount: -request.amount,
        type: TransactionType.WITHDRAWAL_PAID,
        status: TransactionStatus.COMPLETED,
        referenceId: requestId.toString(),
        description: `کارمزد ${request.feePercent}% (${request.feeAmount.toLocaleString()} تومان)`,
      });
      await this.transactionRepo.save(transaction);
    } else {
      throw new BadRequestException('خطا در واریز به بانک');
    }
  }

  async rejectWithdrawal(requestId: number, adminId: number, reason: string): Promise<void> {
    const request = await this.withdrawalRepo.findOne({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('درخواست یافت نشد');
    if (request.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('درخواست قبلاً پردازش شده است');
    }
    request.status = WithdrawalStatus.REJECTED;
    request.rejectionReason = reason;
    request.processedBy = adminId;
    request.processedAt = new Date();
    await this.withdrawalRepo.save(request);
  }

  async addBankAccount(vendorId: number, dto: any): Promise<BankAccountDto[]> {
    const account = this.bankAccountRepo.create({ ...dto, vendor: { id: vendorId } });
    return this.bankAccountRepo.save(account);
  }

  async getBankAccounts(vendorId: number): Promise<BankAccount[]> {
    return this.bankAccountRepo.find({ where: { vendor: { id: vendorId } } });
  }

  async deleteBankAccount(accountId: number, vendorId: number): Promise<void> {
    const result = await this.bankAccountRepo.delete({ id: accountId, vendor: { id: vendorId } });
    if (result.affected === 0) throw new NotFoundException('حساب بانکی یافت نشد');
  }
}