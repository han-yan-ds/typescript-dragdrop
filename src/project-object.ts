/**
 * Interfaces and enums for the project/listener object
 */
namespace App {
  export enum ProjectStatus { Pending, Active, Finished }
  
  export class Project{
    constructor(
      public id: number,
      public title: string,
      public description: string,
      public numPeople: number,
      public status: ProjectStatus//enum
      ) {}
  }

  export type Listener = (project: Project[]) => void;
}