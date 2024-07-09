export function uint8ArrayToBase64(array: Uint8Array) {
  return btoa(String.fromCharCode.apply(null, [...array]));
}

export function base64ToUint8Array(base64: string) {
  return new Uint8Array([...atob(base64)].map((c) => c.charCodeAt(0)));
}
