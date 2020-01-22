/**
 * Defining Project State (singleton) object AND instantiating it!!
 * The class isn't exported, but the instance is!
 */
namespace App {
  
  class ProjectState { // this is a singleton class, only 1 projectState can exist
    private projects: Project[] = [];
    private listeners: Listener[] = [];
    private _id = 0;

    private static instance: ProjectState; // singleton (private static instance of itself)

    private constructor() {} // singleton (private constructor)

    static getInstance() { // singleton (public getInstance)
      if (this.instance) return this.instance;
      this.instance = new ProjectState();
      return this.instance;
    }

    addListener(listenerFunc: Listener) {
      this.listeners.push(listenerFunc);
    }

    addProject(title: string, description: string, numPeople: number) {
      const newProject = new Project(this._id, title, description, numPeople, ProjectStatus.Pending); // enum
      this.projects.push(newProject);
      this.updateListeners();
      this._id++;
    }

    moveProject(projId: number, newStatus: ProjectStatus) {
      const targetProject = this.projects.find((project) => project.id === projId);
      if (targetProject) {
        targetProject.status = newStatus;
        this.updateListeners();
      }
    }

    // deleteProject(projId: number) {
    //   const targetProjectIndex = this.projects.findIndex((project) => project.id === projId);
    //   if (targetProjectIndex !== -1) {
    //     this.projects.splice(targetProjectIndex, 1);
    //     this.updateListeners();
    //   }
    // }

    private updateListeners() {
      this.listeners.forEach((listenerFunc) => {
        // run a list of functions (listenerFunc) on each project
        listenerFunc([...this.projects]);
      })
    }
  }

  export const projectState = ProjectState.getInstance();
}