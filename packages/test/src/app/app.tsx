import React, { useEffect, useState } from "react";
import { createWorker } from "@web-threads/web-threads";
import task from "./worker-code";

export const App = () => {
  const [worker, setWorker] = useState<any>();

  // useEffect(() => {
  //   if (worker) {
  //     return;
  //   }

  //   async function work() {
  //     const w = createWorker(doWork);
  //     setWorker(w);

  //     const buf = new ArrayBuffer(3);
  //     const view = new Uint8Array(buf);
  //     view[0] = 2;
  //     view[1] = 3;

  //     const response = await w.post(buf, [buf]);
  //     console.log("Worker response=", new Uint8Array(response));
  //   }

  //   work();
  // }, [worker]);

  useEffect(() => {
    if (worker) {
      return;
    }

    async function work() {
      const w = createWorker(task);
      setWorker(w);

      try {
        const response = await w.post([2, 3]);
        console.log(`Worker response=${response}`);
      } catch (err) {
        console.log(`Worker error=${err.message}`);
      }

      w.terminate();
    }

    work();
  }, [worker]);

  return <div>Hi</div>;
};

//   useEffect(() => {
//     if (worker) {
//       return;
//     }

//     async function work() {
//       const w = createWorker(`async message => {
//   const [left, right] = message;
//   return left * right;
// }`);
//       setWorker(w);

//       try {
//         const response = await w.post([2, 3]);
//         console.log(`Worker response=${response}`);
//       } catch (err) {
//         console.log(`Worker error=${err.message}`);
//       }

//       w.terminate();
//     }

//     work();
//   }, [worker]);

//   return <div>Hi</div>;
// };

export default App;
