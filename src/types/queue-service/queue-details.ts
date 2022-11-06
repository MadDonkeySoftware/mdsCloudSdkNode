export type QueueDetails = {
  /**
   * The orid that identifies this queue.
   */
  orid: string;
  /**
   * the resource to invoke upon queueing a message to this queue.
   */
  resource?: string;
  /**
   * the dlq to place messages in when the resource fails to invoke properly.
   */
  dlq?: string;
};
