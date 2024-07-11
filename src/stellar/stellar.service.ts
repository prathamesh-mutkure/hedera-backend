import { Injectable } from '@nestjs/common';
import {
  AccountService,
  Stellar,
  StellarConfiguration,
  Wallet,
  AccountKeypair,
  Keypair,
  SigningKeypair,
} from '@stellar/typescript-wallet-sdk';
import { randomBytes } from 'crypto';
import { base64ToUint8Array, uint8ArrayToBase64 } from 'src/lib/utils';

@Injectable()
export class StellarService {
  private readonly wallet: Wallet;
  private readonly stellar: Stellar;
  private readonly account: AccountService;
  private readonly keyPair: SigningKeypair;

  constructor() {
    // const wallet = new Wallet({
    //   stellarConfiguration: StellarConfiguration.TestNet(),
    // });

    // const stellar = wallet.stellar();
    // const account = stellar.account();

    // console.log('hehe');

    // const keyPair = StellarService.recoverKeyPairFromBase64({
    //   account,
    //   base64: '6SogqfWVNvLRAJs7WRtofxKxSkQ=',
    // });

    // console.log('nkn');

    const { wallet, stellar, account, keyPair } = StellarService.buildAcc();

    this.wallet = wallet;
    this.stellar = stellar;
    this.account = account;
    this.keyPair = keyPair;
  }

  private static buildAcc() {
    const wallet = new Wallet({
      stellarConfiguration: StellarConfiguration.TestNet(),
    });

    const stellar = wallet.stellar();
    const account = stellar.account();

    const keyPair = StellarService.recoverKeyPairFromBase64({
      account,
      base64: '1TLGwUGyq7qFBcw40koBw18DW5lVqaJtpDtl3I9UrEg=',
    });

    return {
      wallet,
      stellar,
      account,
      keyPair,
    };
  }

  // Create a new key pair
  // Not for use in production
  private static generateNewKeyPair({ account }: { account: AccountService }) {
    const rand = randomBytes(32);
    const keyPair = account.createKeypairFromRandom(Buffer.from(rand));

    console.log(`Base64 - "${uint8ArrayToBase64(rand)}"`);
    console.log(`PK - "${keyPair.publicKey}"`);
    console.log(`SK - "${keyPair.secretKey}"`);

    return keyPair;
  }

  // This method will be used to recover a key pair from a secret base64 string.
  // TODO: seed phase to base64 support
  static recoverKeyPairFromBase64({
    base64,
    account,
  }: {
    base64: string;
    account: AccountService;
  }) {
    const keyPair = account.createKeypairFromRandom(
      Buffer.from(base64ToUint8Array(base64)),
    );

    return keyPair;
  }

  async test() {
    // console.log(this.keyPair);
    // const txBuilder = await this.stellar.transaction({
    //   sourceAddress: this.keyPair,
    // });
    // const tx = txBuilder.createAccount(this.keyPair).build();
    // StellarService.generateNewKeyPair({
    //   account: this.account,
    // });
    // const kp = StellarService.recoverKeyPairFromBase64({
    //   base64: '1TLGwUGyq7qFBcw40koBw18DW5lVqaJtpDtl3I9UrEg=',
    //   account: this.account,
    // });
    //
    // const kp = this.keyPair;
    // console.log(kp.publicKey);
    // console.log(kp.secretKey);
    //
    // Base64 - "1TLGwUGyq7qFBcw40koBw18DW5lVqaJtpDtl3I9UrEg="
    // PK - "GBLPHQ4IH45EJ4J3D7FO2WGECCFGINRT3EYFJ5IDA6Q5NFV2NTCTRYUF"
    // SK - "SDKTFRWBIGZKXOUFAXGDRUSKAHBV6A23TFK2TITNUQ5WLXEPKSWERN3N"
  }
}
