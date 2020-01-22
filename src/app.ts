/**
 * Importing namespaces
 */
/// <reference path='./drag-drop.ts'/> 
/// <reference path='./decorators.ts'/>
/// <reference path='./validation.ts'/>
/// <reference path='./templates.ts'/>

/*
  Project Object
*/
enum ProjectStatus { Pending, Active, Finished }

class Project{
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public numPeople: number,
    public status: ProjectStatus//enum
    ) {}
}

/* 
  Listener Object Type
*/
type Listener = (project: Project[]) => void;



/**
  Project State Management
*/
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

const projectState = ProjectState.getInstance();



/* 
  ProjectInput class
*/
class ProjectInput extends Templates.Template<HTMLDivElement, HTMLFormElement> {
  titleInput: HTMLInputElement; descriptionInput: HTMLInputElement; peopleInput: HTMLInputElement;

  constructor() {
    super('project-input', 'input-section', 'afterbegin', 'user-input');
    /*
      Below is assigning the contents of the form inputs to this instance's properties
    */
    this.titleInput = this._element.querySelector('#title')! as HTMLInputElement; // querySelector instead of getElementById... for a node instead of document
    this.descriptionInput = this._element.querySelector('#description')! as HTMLInputElement;
    this.peopleInput = this._element.querySelector('#people')! as HTMLInputElement;
   
    this.attachSubmitHandler();
  }

  renderComponent() {} // to satisfy the abstract class requiring renderComponent()

  private attachSubmitHandler() {
    this._element.addEventListener('submit', this.submitHandler);
  }

  /* Button-Click methods */
  @Decorators.AutoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInputs = this.gatherUserInput();
    if (userInputs) {
      const [title, desc, people] = userInputs;
      projectState.addProject(title as string, desc as string, people as number);
    }
  }

  private gatherUserInput(): (string | number)[] | void {
    let results;
    const titleValidatableString: Validation.ValidatableString = {
      value: this.titleInput.value,
      isRequired: true,
      minLength: 2,
    }
    const descriptionValidatableString: Validation.ValidatableString = {
      value: this.descriptionInput.value,
      isRequired: true,
      minLength: 5,
    }
    const peopleValidatableNumber: Validation.ValidatableNumber = {
      value: +this.peopleInput.value,
      isRequired: true,
      min: 1,
    }
    const allInputsValidatable = [titleValidatableString, descriptionValidatableString, peopleValidatableNumber];
    if (allInputsValidatable.every(Validation.validate)) {
      results = allInputsValidatable.map((validatable) => validatable.value);
      this.clearInputs();
    }
    return results; // not all are valid, results is undefined
  }

  private clearInputs(): void {
    this.titleInput.value = '';
    this.descriptionInput.value = '';
    this.peopleInput.value = '';
  }
}


/*
  ProjectItem class
*/
class ProjectItem extends Templates.Template<HTMLLIElement, HTMLElement> implements DragDrop.Draggable {
  project: Project;

  get people() {
    const num = this.project.numPeople;
    return (num === 1) ? `${num} person assigned` : `${num} people assigned`;
  }

  constructor(proj: Project) {
    let status;
    switch (proj.status) {
      case ProjectStatus.Pending:
        status = 'pending';
        break;
      case ProjectStatus.Active:
        status = 'active';
        break;
      case ProjectStatus.Finished:
        status = 'finished';
        break;
    }
    super('single-project', `${status}-projects-list`, "beforeend", `project-#${proj.id}`);
    this.project = proj;

    this.renderComponent();

    this.attachDraggableHandler();
  }

  renderComponent() {
    this._element.querySelector('h2')!.textContent = this.project.title;
    this._element.querySelector('h3')!.textContent = this.people;
    this._element.querySelector('p')!.textContent = this.project.description;
  }

  /*
    Drag handling code
  */
  attachDraggableHandler() {
    this._element.addEventListener('dragstart', this.dragStartHandler);
    this._element.addEventListener('dragend', this.dragEndHandler);
  }

  @Decorators.AutoBind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', this.project.id.toString()); // attaching data TO this DragEvent
    event.dataTransfer!.effectAllowed = 'move';
  }

  dragEndHandler(_event: DragEvent) {}
}


/* 
  ProjectList class
*/
class ProjectList extends Templates.Template<HTMLDivElement, HTMLElement> implements DragDrop.Droppable {
  _assignedProjects: Project[];

  constructor(private listName: 'pending' | 'active' | 'finished') { // I could make this more specific by only allowing certain strings, eg: "active" or "finished"
    super('project-list', 'project-list-section', 'beforeend', `${listName}-projects`);
    this._assignedProjects = [];

    projectState.addListener((projectsList: Project[]) => {
      const filteredProjects = projectsList.filter((proj) => {
        switch (proj.status) {
          case ProjectStatus.Pending:
            return listName === 'pending';
          case ProjectStatus.Active:
            return listName === 'active';
          case ProjectStatus.Finished:
            return listName === 'finished';
        }
      })
      this._assignedProjects = filteredProjects;
      this.renderProjects();

      this.attachDroppableHandler();
    });
    
    this.renderComponent();
  }

  private renderProjects() {
    const listEle = document.getElementById(`${this.listName}-projects-list`)!;
    listEle.innerHTML = ''; // clears out list contents before rerendering entire list
    this._assignedProjects.forEach((project) => {
      const renderedProject = new ProjectItem(project);
      renderedProject.renderComponent();
    });
  }

  renderComponent() {
    this._element.querySelector('ul')!.id = `${this.listName}-projects-list`;
    this._element.querySelector('h2')!.textContent = `${this.listName.toUpperCase()} PROJECTS`;
  }

  /*
    Drop handling code
  */
  attachDroppableHandler() {
    this._element.addEventListener('dragover', this.dragOnHandler);
    this._element.addEventListener('dragleave', this.dragOffHandler);
    this._element.addEventListener('drop', this.dropHandler);
  }

  @Decorators.AutoBind
  dragOnHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') { // limiting to only drags of 'text/plain' format
      event.preventDefault();
      this._element!.classList.add('droppable');
    }
  }

  @Decorators.AutoBind
  dragOffHandler(_event: DragEvent) {
    this._element!.classList.remove('droppable');
  }

  @Decorators.AutoBind
  dropHandler(event: DragEvent) {
    const projectId = Number(event.dataTransfer?.getData('text/plain'));
    let status;
    switch (this.listName) {
      case 'active':
        status = ProjectStatus.Active;
        break;
      case 'pending':
        status = ProjectStatus.Pending;
        break;
      case 'finished':
        status = ProjectStatus.Finished;
        break;
    }
    projectState.moveProject(projectId, status);
    
    this.dragOffHandler(event);
  }
}


/*
  Running the scripts
*/
const pendingProjectList = new ProjectList('pending');
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
const projectInput = new ProjectInput();