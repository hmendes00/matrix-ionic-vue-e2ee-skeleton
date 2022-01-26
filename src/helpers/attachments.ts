import { Camera, CameraResultType } from '@capacitor/camera';
import { decodeBase64, encodeBase64 } from 'matrix-js-sdk/lib/crypto/olmlib';

/**
 * Decrypt an attachment.
 * @param {ArrayBuffer} ciphertextBuffer The encrypted attachment data buffer.
 * @param {Object} info The information needed to decrypt the attachment.
 * @param {Object} info.key AES-CTR JWK key object.
 * @param {string} info.iv Base64 encoded 16 byte AES-CTR IV.
 * @param {string} info.hashes.sha256 Base64 encoded SHA-256 hash of the ciphertext.
 * @return {Promise} A promise that resolves with an ArrayBuffer when the attachment is decrypted.
 */
 export async function DecryptAttachment(ciphertextBuffer, info) {
    if (info === undefined || info.key === undefined || info.iv === undefined
        || info.hashes === undefined || info.hashes.sha256 === undefined) {
       throw new Error("Invalid info. Missing info.key, info.iv or info.hashes.sha256 key");
    }

    
    
    const ivArray = decodeBase64(info.iv);
    // re-encode to not deal with padded vs unpadded
    
    const expectedSha256base64 = encodeBase64(decodeBase64(info.hashes.sha256));
    // Check the sha256 hash
    
    const digestResult = await crypto.subtle.digest("SHA-256", ciphertextBuffer);
    console.log(digestResult);
    if (encodeBase64(new Uint8Array(digestResult)) != expectedSha256base64) {
        throw new Error("Mismatched SHA-256 digest");
    }
    console.log('passed')
    let counterLength;
    if (info.v == "v1" || info.v == "v2") {
        // Version 1 and 2 use a 64 bit counter.
        counterLength = 64;
    } else {
        // Version 0 uses a 128 bit counter.
        counterLength = 128;
    }

    const decryptedBuffer = await crypto.subtle.decrypt({ length: counterLength, iv: ivArray, counter: counterLength, name: 'image' }, info.key, ciphertextBuffer);
    return decryptedBuffer;
}

export const OpenImagePicker = () => {
    return Camera.checkPermissions().then((permissionStatus) => {
      if(permissionStatus.photos) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        return Camera.getPhoto({ 
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri
         })
      } else {
        Camera.requestPermissions();
      }
    });
  };