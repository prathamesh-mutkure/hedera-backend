import { Injectable } from '@nestjs/common';
import { Keypair } from '@stellar/stellar-sdk';
import * as StellarSdk from '@stellar/stellar-sdk';
import { AccountResponse } from '@stellar/stellar-sdk/lib/horizon';

@Injectable()
export class StellarService {
  private readonly server: StellarSdk.Horizon.Server;
  private readonly keyPair: Keypair;
  private readonly account: AccountResponse;

  constructor() {
    const server = new StellarSdk.Horizon.Server(
      'https://horizon-testnet.stellar.org',
    );

    const keyPair = Keypair.fromSecret(
      'SBLPGXDOED4PRS4J42UYPLS5BENQFKV5HMACAHMDCUD3TNGVF7UYFFO4',
    );

    this.server = server;
    this.keyPair = keyPair;
  }

  async loadAccount() {
    const account = await this.server.loadAccount(this.keyPair.publicKey());
    return account;
  }

  private static async fundAccount(keyPair: Keypair) {
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

  async test() {}
}

// PK - GAKK3J2FUPRA7JM3GVZWG7VUZGQ5FERXWXVNWHSZ2OIT57J3IR2B4WH2
// SK - SBLPGXDOED4PRS4J42UYPLS5BENQFKV5HMACAHMDCUD3TNGVF7UYFFO4
