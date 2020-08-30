import { Task, PostMessage, WorkerMessage } from "./types";

/**
 * Creates a string that can be used to construct a web worker from a Blob.
 * @param task The function that will actually process the data rpovided to the worker.
 */
export function generateWorkerCode(task: Task | string) {
  return `
const task = ${typeof task === "function" ? task.toString() : task};

self.onmessage = ${handleMessage()};
`;
}

function handleMessage() {
  const task = async (_) => {};

  const handler = async (evt: MessageEvent) => {
    const { id, message, transferable } = evt.data as PostMessage;
    console.log(`WT worker incoming: id=${id}, transferable=${!!transferable}`);

    try {
      const data = await task(message);

      const args: [WorkerMessage, any?] = [{ id, data, transferable }];
      if (transferable) {
        args[0].data = message;
        args.push([message]);
      }

      ((self as unknown) as Worker).postMessage(...args);
    } catch (err) {
      ((self as unknown) as Worker).postMessage({
        id,
        error: {
          message:
            err.message || "Client provided 'doWork' function threw an error.",
        },
      });
    }
  };

  return handler.toString();
}
