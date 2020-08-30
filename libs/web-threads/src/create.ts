import { PostMessage, WorkerMessage, Task } from "./types";
import { generateWorkerCode } from "./worker";

let nextId = Date.now();

export default function createWorker(task: Task | string | URL) {
  const requests = new Map<number, RejectResolve>();

  let uri: string | URL;
  if (typeof task === "function") {
    const code = generateWorkerCode(task);
    // console.log(`createWorker:\r\n${code}`);
    uri = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
  } else {
    uri = task;
  }

  const worker = new Worker(uri);
  worker.addEventListener("message", (evt) => {
    const { id, data, error } = evt.data as WorkerMessage;
    console.log(`WT result: id=${id}, error=${!!error}`);

    const resolvers = getResolvers(id, requests);
    if (!resolvers) {
      return;
    }

    const { resolve, reject } = resolvers;
    !error ? resolve(data) : reject(error);
  });
  worker.addEventListener("messageerror", (evt) => {
    const { id, message } = evt.data as any;
    console.log(`WT message error: id=${id}`);

    const resolvers = getResolvers(id, requests);
    if (!resolvers) {
      return;
    }

    const { reject } = resolvers;
    reject(message);
  });
  worker.addEventListener("error", (evt) => {
    if (!evt.error) {
      throw evt;
    }

    const { id, message } = evt.error as any;
    console.log(`WT error: id=${id}`);

    const resolvers = getResolvers(id, requests);
    if (!resolvers) {
      return;
    }

    const { reject } = resolvers;
    reject(message);
  });

  /**
   * Post a message to the worker.
   * @param message The data to send.
   * @param transfer Optional array of objects to transfer.
   */
  function post(message: any, transfer: Transferable[]): Promise<any>;
  function post(message: any): Promise<any>;
  function post(message: any, arg?: any) {
    let postPromise: Promise<any>;
    // eslint-disable-next-line prefer-const
    postPromise = new Promise((resolve, reject) => {
      nextId++;
      const msg: PostMessage = {
        id: nextId,
        message,
        transferable: arg && Array.isArray(arg),
      };

      console.log(`WT post: id=${nextId}`);
      requests.set(nextId, { resolve, reject });

      worker.postMessage(msg, arg);
    });

    return postPromise;
  }

  /**
   * Immediately stop the worker.
   */
  function terminate() {
    worker.terminate();
    requests.clear();
  }

  return Object.freeze({
    post,
    terminate,
  });
}

function getResolvers(id: number, requests: Map<number, RejectResolve>) {
  if (!requests.has(id)) {
    return null;
  }

  const request = requests.get(id);
  requests.delete(id);

  return request;
}

type RejectResolve = {
  reject: (reason?: any) => void;
  resolve: (value?: any) => void;
};
