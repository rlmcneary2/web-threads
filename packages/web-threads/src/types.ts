export type Task = (message: any) => Promise<any>;

export type PostMessage = { id: number; message: any; transferable?: boolean };

export type WorkerMessage = {
  data: any;
  error?: Error;
  id: number;
  transferable?: boolean;
};
