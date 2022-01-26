import { IndexedDBStoreWorker } from "matrix-js-sdk/src/indexeddb-worker";

const ctx: Worker = self as any;

const remoteWorker = new IndexedDBStoreWorker(ctx.postMessage);

ctx.onmessage = remoteWorker.onMessage;