
import { crossSigningCallbacks } from '@/helpers/ssss';
import router from '@/router';
import { ICreateClientOpts, IndexedDBCryptoStore, MatrixClient } from 'matrix-js-sdk';
import { verificationMethods } from 'matrix-js-sdk/lib/crypto';
import { IVerificationChannel } from 'matrix-js-sdk/lib/crypto/verification/request/Channel';
import { VerificationRequest } from 'matrix-js-sdk/lib/crypto/verification/request/VerificationRequest';
import ConfigService from './config';
import { GetClient } from './matrix';

// send request to specific account
let currentVerificationRequest: VerificationRequest|null = null;

interface VerificationChallengeInterface {
    challenge: Array<any>;
    handleResult(challengeMatches: any): void;
    cancel(): void;
    cancelPromise: Promise<VerificationRequest<IVerificationChannel>>;
}

interface CryptoServiceInterface {
    cryptoStore?: IndexedDBCryptoStore;
    isDeviceVerified(): boolean;
    setDeviceAsVerified(): void;
    verificationChallengeObj: Promise<VerificationChallengeInterface|null>;
}

const verifyDevice = async (client: MatrixClient, userId: string, deviceId: string) => {
    await client.setDeviceKnown(userId, deviceId, true);
    await client.setDeviceVerified(userId, deviceId, true);
}

/**
 * Check (by userId) if device is verified
 */
 const IsDeviceVerified = (client: MatrixClient): boolean => {
    const device = client.getStoredDevice(client.getUserId(), client.getDeviceId());
    return !device.isUnverified();
}

export const CryptoService: CryptoServiceInterface = {
    cryptoStore: undefined,
    isDeviceVerified: () => !!localStorage.getItem('deviceVerified'),
    setDeviceAsVerified: () => { 
      localStorage.setItem('deviceVerified', 'true');
      const client = GetClient();
      verifyDevice(client, client.getUserId(), client.getDeviceId());
    },
    verificationChallengeObj: Promise.resolve(null)

}

// The pickle key is a string of unspecified length and format.  For AES, we
// need a 256-bit Uint8Array. So we HKDF the pickle key to generate the AES
// key.  The AES key should be zeroed after it is used.
export const PickleKeyToAesKey = async (pickleKey: string): Promise<Uint8Array> => {
  const pickleKeyBuffer = new Uint8Array(pickleKey.length);
  for (let i = 0; i < pickleKey.length; i++) {
      pickleKeyBuffer[i] = pickleKey.charCodeAt(i);
  }
  const hkdfKey = await window.crypto.subtle.importKey(
      "raw", pickleKeyBuffer, "HKDF", false, ["deriveBits"],
  );
  pickleKeyBuffer.fill(0);
  return new Uint8Array(await window.crypto.subtle.deriveBits(
      {
          name: "HKDF", hash: "SHA-256",
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore: https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/879
          salt: new Uint8Array(32), info: new Uint8Array(0),
      },
      hkdfKey,
      256,
  ));
}

export const GetCryptoStore = () => {
    if(!CryptoService.cryptoStore) {
        CryptoService.cryptoStore = new IndexedDBCryptoStore(
            indexedDB, ConfigService.cryptoStoreName,
        );
    }

    return CryptoService.cryptoStore;
}

export const DownloadMyKeys = (client: MatrixClient) => {
    return client.downloadKeys([client.getUserId()]);
}

export const GenerateClientOptsEncryption = (client: MatrixClient, deviceId: string): ICreateClientOpts => { 
    return { 
        baseUrl: ConfigService.MatrixUrl,
        cryptoStore: GetCryptoStore(),
        deviceId: client.getDeviceId() || deviceId,
        accessToken: client.getAccessToken(),
        userId: client.getUserId(),
        store: client.store,
        sessionStore: {
            setLocalTrustedBackupPubKey: (trustedPubKey) => localStorage.setItem(`${ConfigService.appStoragePrefix}MatrixPubKey`, trustedPubKey),
            getLocalTrustedBackupPubKey: () => localStorage.getItem(`${ConfigService.appStoragePrefix}MatrixPubKey`)
        },
        cryptoCallbacks: {},
        verificationMethods: [verificationMethods.SAS]
    };
}

const StartVerification = async (request: VerificationRequest): Promise<VerificationChallengeInterface> => {
  console.log('START VERIFICATION', request, request.verifier);
    if (!request.verifier) {
      if (!request.initiatedByMe) {
        await request.accept();
        if (request.cancelled) {
          throw new Error("verification aborted");
        }
        // Auto chose method as the only one we both support.
        await request.beginKeyVerification(
          request.methods[0],
          request.targetDevice
        );
      } else {
        await request.waitFor(() => request.started || request.cancelled);
      }
      if (request.cancelled) {
        throw new Error("verification aborted");
      }
    }
    const sasEventPromise = new Promise<any>(resolve =>
      request.verifier.once("show_sas", resolve)
    );
    request.verifier.verify().then(() => CryptoService.setDeviceAsVerified());
    const sasEvent = await sasEventPromise;
    if (request.cancelled) {
      throw new Error("verification aborted");
    }
    let challenge = [];
    if (sasEvent.sas.emoji) {
      challenge = sasEvent.sas.emoji;
    } else if (sasEvent.sas.decimal) {
      challenge = sasEvent.sas.decimal;
    } else {
      sasEvent.cancel();
      throw new Error("unknown verification method");
    }
    router.push('/popup/device-verification');
    return {
      challenge,
      handleResult(challengeMatches) {
        if (!challengeMatches) {
          sasEvent.mismatch();
        } else {
          sasEvent.confirm();
        }
      },
      cancel() {
        if (!request.cancelled) {
          sasEvent.cancel();
        }
      },
      cancelPromise: request.waitFor(() => request.cancelled),
    };
}

export const SendVerificationRequestIfUnverified = async (client: MatrixClient) => {
  if(!CryptoService.isDeviceVerified() || !IsDeviceVerified(client)) {
    currentVerificationRequest = await client.requestVerification(client.getUserId());
    CryptoService.verificationChallengeObj = StartVerification(currentVerificationRequest);

  }
}

/**
 * initialize support for e2ee and download and stores own keys 
 * @param client - Current active matrix client
 * @param shouldSendVerification - if true, and device is unverified, sends verification request to an already active device (to start emoji match).
 * defaults to false.
 */
export const SetupCryptoBasics = async (client: MatrixClient, shouldSendVerification = false) => {
  await client.initCrypto();
  await DownloadMyKeys(client);
  if(shouldSendVerification) {
    SendVerificationRequestIfUnverified(client);
  }
}

/**
 * Startup crypto store, adds cryptoCallbacks for crossSigning and generate options for new client instance
 * @param client - Current active matrix client
 * @param deviceId - deviceId
 * @returns Returns the generated client options ready for e2ee
 */
export const PrepareCryptoBasics = async (client: MatrixClient, deviceId: string): Promise<ICreateClientOpts> => {
  await GetCryptoStore().startup();
  const clientOpts = GenerateClientOptsEncryption(client, deviceId);
  Object.assign(clientOpts.cryptoCallbacks, crossSigningCallbacks);
  return clientOpts;
}



// TODO:: export const SignOutDevice = async (client: MatrixClient, deviceId: string) => {
//     // const result = await client.deleteDevice(deviceId, {
//     //     type: 'm.login.password',

//     // });
// }