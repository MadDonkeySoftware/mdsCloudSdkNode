export type QueueOptions = {
  /**
   * The resource to invoke upon queueing a message to this queue.
   */
  resource?: string;
  /**
   * The dlq to place messages in when the resource fails to invoke properly.
   */
  dlq?: string;
};
