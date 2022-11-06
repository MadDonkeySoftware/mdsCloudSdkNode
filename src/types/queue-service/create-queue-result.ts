export type CreateQueueResult = {
  /**
   * "created" or "exists" based on the pre-existence of the queue.
   */
  status: string;
  name: string;
  orid: string;
};
