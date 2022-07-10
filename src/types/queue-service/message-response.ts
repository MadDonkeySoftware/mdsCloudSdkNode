export type MessageResponse = {
  /**
   * the timestamp of when this message was first received
   */
  fr: number;

  /**
   * the message unique identifier
   */
  id: string;

  /**
   * the body of the message
   */
  message: string;

  /**
   * the number of times this message was received
   */
  rc: number;
  /**
   * the timestamp of when this message was sent / created.
   */
  sent: number;
};
