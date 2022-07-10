export type QueueLength = {
  /**
   * the number of messages in the queue
   */
  size: number;

  /**
   * The orid that identifies this queue.
   */
  orid: string;
};
