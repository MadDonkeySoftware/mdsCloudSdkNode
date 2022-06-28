export interface DirectoryContents {
  /**
   * The sub directories of the container or path
   */
  directories?: string[];

  /**
   * The files residing in the container or path
   */
  files?: string[];
}
