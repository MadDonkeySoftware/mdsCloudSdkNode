export interface EnvironmentUrls {
  /**
   * The url of the identity service
   */
  identityUrl?: string;

  /**
   * THe url of the notification service
   */
  nsUrl?: string;

  /**
   * THe url of the queue service
   */
  qsUrl?: string;

  /**
   * THe url of the file service
   */
  fsUrl?: string;

  /**
   * THe url of the serverless functions service
   */
  sfUrl?: string;

  /**
   * THe url of the state machine service
   */
  smUrl?: string;

  /**
   * True to allow consumption of self signed SSL certs; False to deny.
   */
  allowSelfSignCert?: boolean;
}
