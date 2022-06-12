import { EnvironmentUrls } from './environment-urls';

export interface EnvironmentConfiguration extends EnvironmentUrls {
  /**
   * The account with which to authenticate
   */
  account: string;

  /**
   * The user with which to authenticate
   */
  userId: string;

  /**
   * The password with which to authenticate
   */
  password: string;
}
