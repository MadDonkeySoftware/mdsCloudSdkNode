import { ContainerListItem } from './container-list-item';

export interface ContainerPathContents {
  directories: ContainerListItem[];
  files: ContainerListItem[];
}
