import { BadRequestException, Injectable } from '@nestjs/common';
import { Keypair } from '@stellar/stellar-sdk';
import * as StellarSdk from '@stellar/stellar-sdk';
import { AccountResponse } from '@stellar/stellar-sdk/lib/horizon';
import axios from 'axios';

@Injectable()
export class StellarService {
  private readonly server: StellarSdk.Horizon.Server;
  private readonly keyPair: Keypair;
  private account: AccountResponse;
  public readonly stellarAccountId: string;

  constructor() {
    const server = new StellarSdk.Horizon.Server(
      'https://horizon-testnet.stellar.org',
    );

    const keyPair = Keypair.fromSecret(
      'SBLPGXDOED4PRS4J42UYPLS5BENQFKV5HMACAHMDCUD3TNGVF7UYFFO4',
    );

    this.server = server;
    this.keyPair = keyPair;
    this.stellarAccountId = keyPair.publicKey();
  }

  async loadAccount() {
    const account = await this.server.loadAccount(this.keyPair.publicKey());
    this.account = account;
    return account;
  }

  async transferFunds({
    destinationAccount,
    amount,
    memoText,
  }: {
    destinationAccount: string;
    amount: number;
    memoText?: string;
  }) {
    const account = await this.loadAccount();

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: destinationAccount,
          asset: StellarSdk.Asset.native(),
          amount: amount.toString(),
        }),
      )
      .addMemo(StellarSdk.Memo.text(memoText ?? ''))
      .setTimeout(180)
      .build();

    transaction.sign(this.keyPair);

    const result = await this.server.submitTransaction(transaction);

    return result;
  }

  async transferMultipleFunds({
    accounts,
    memoText,
  }: {
    accounts: { destinationAccount: string; amount: number }[];
    memoText?: string;
  }) {
    try {
      const account = await this.loadAccount();

      // Start building the transaction.
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      });

      accounts.forEach((item) => {
        transaction.addOperation(
          StellarSdk.Operation.payment({
            destination: item.destinationAccount,
            asset: StellarSdk.Asset.native(),
            amount: item.amount.toString(),
          }),
        );
      });

      if (memoText) {
        transaction.addMemo(StellarSdk.Memo.text(memoText));
      }

      const builtTxn = transaction.setTimeout(180).build();

      builtTxn.sign(this.keyPair);

      const result = await this.server.submitTransaction(builtTxn);

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  static async fundAccount(keyPair: Keypair) {
    try {
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(
          keyPair.publicKey(),
        )}`,
      );

      const data: any = await response.json();
      const publicKey = data.source_account;

      console.log('New account created -', publicKey);

      return true;
    } catch (error) {
      console.error('Error funding account', error);
      return false;
    }
  }

  static async getTxnOperations({ txHash }: { txHash: string }) {
    const txnDetails = await axios.get(
      `https://horizon-testnet.stellar.org/transactions/${txHash}/operations`,
    );

    const opData = txnDetails.data as {
      _embedded: {
        records: {
          id: string;
          transaction_hash: string;
          source_account: string;
          type: string;
          created_at: Date;
          transaction_successful: boolean;
          from: string;
          to: string;
          amount: string;
          asset_type: string;
        }[];
      };
    };

    if (!opData || opData._embedded.records.length === 0) {
      throw new BadRequestException(
        'Transaction does not contain any operations',
      );
    }

    const op = opData._embedded.records.find((item) => item.type === 'payment');

    return op;
  }

  async test() {}
}

// PK - GAKK3J2FUPRA7JM3GVZWG7VUZGQ5FERXWXVNWHSZ2OIT57J3IR2B4WH2
// SK - SBLPGXDOED4PRS4J42UYPLS5BENQFKV5HMACAHMDCUD3TNGVF7UYFFO4
