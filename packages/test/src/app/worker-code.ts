// export default async function doWork(message: any) {
//   const view = new Uint8Array(message);
//   console.log("doWork: message arrived=", view);
//   const left = view[0];
//   const right = view[1];
//   view[2] = left * right;
// }

export default async function task(message: any) {
  const [left, right] = message as number[];
  return left * right;
}

// export default async function doWork(message: any) {
//   throw new Error();
// }
