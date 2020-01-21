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
    this.listeners.forEach((listenerFunc) => {
      // run a list of functions (listenerFunc) on each project
      listenerFunc([...this.projects]);
    })
    this._id++;
  }
}

const projectState = ProjectState.getInstance();


/* 
  import {AutoBind} from './autobind';
*/
function AutoBind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value; // This is how I access the method ITSELF when decorating a method
  const adjustedDescriptor: PropertyDescriptor = { // cloning the descriptor EXCEPT now it's an accessor descriptor instead of a method... has get instead of value
    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable,
    get() { // this is where the magic is: by calling the originalMethod, I'll actually call this getter INSTEAD, which gives me a Bound-Version of originalMethod instead
      return originalMethod.bind(this);
    }
  }
  return adjustedDescriptor;
}


/* 
  import as a utility
*/
interface Validatable {
  value: string | number;
  isRequired?: boolean;
}

interface ValidatableString extends Validatable {
  value: string;
  minLength?: number;
  maxLength?: number;
}

interface ValidatableNumber extends Validatable {
  value: number;
  min?: number;
  max?: number;
}

function isValidatableString(field: Validatable): field is ValidatableString { // custom typeguard function return type, for TS error checking
  // type guard; it's an instanceof for an interface... in spirit
  return (typeof field.value === 'string');
}

function validate(field: ValidatableString | ValidatableNumber): boolean {
  let isValidTotal = true;
  if (field.isRequired) isValidTotal = isValidTotal && (field.value.toString().trim().length !== 0);
  if (isValidatableString(field)) { // checks for strings
    if (field.minLength != null) isValidTotal = isValidTotal && (field.value.trim().length >= field.minLength);
    if (field.maxLength != null) isValidTotal = isValidTotal && (field.value.trim().length <= field.maxLength);  
  } else { // checks for numbers
    if (field.min != null) isValidTotal = isValidTotal && (+field.value >= field.min);
    if (field.max != null) isValidTotal = isValidTotal && (+field.value <= field.max);
  }
  return isValidTotal;
}

/*
  HTML Component/Template superclass
*/
abstract class Template<H extends HTMLElement, E extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: H;
  _element: E;

  constructor(
    templateId: string, 
    hostId: string, 
    private insertPosition: 'beforebegin' | 'beforeend' | 'afterbegin' | 'afterend',
    newElementId?: string
    ) {
    /* 
      Below, notice a couple things here:
      1) I added "!" to tell TypeScript that this element cannot be null
      2) I casted it to an HTML___Element type, so that I can tell TS 
        that this.___Element will definitely have required properties
    */
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostId)! as H;
    /*
      Below, notice:
      1) document.importNode copies a node (and if true, its children)
      2) this._element is a copy of the node's child, which is a form that I want to copy and insert somewhere else
    */
    const importedNode = document.importNode(this.templateElement.content, true); // <template><form><form/></template>
    this._element = importedNode.firstElementChild! as E; // <form/>
    if (newElementId) this._element.id = newElementId; // adding a new ID for css purposes
    
    this.attach();
  }

  private attach() {
    // inserts right after the opening tag of the hostElement
    this.hostElement.insertAdjacentElement(this.insertPosition, this._element);
  }

  abstract renderComponent(): void;
}


/* 
  ProjectInput class
*/
class ProjectInput extends Template<HTMLDivElement, HTMLFormElement> {
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
  @AutoBind
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
    const titleValidatableString: ValidatableString = {
      value: this.titleInput.value,
      isRequired: true,
      minLength: 2,
    }
    const descriptionValidatableString: ValidatableString = {
      value: this.descriptionInput.value,
      isRequired: true,
      minLength: 5,
    }
    const peopleValidatableNumber: ValidatableNumber = {
      value: +this.peopleInput.value,
      isRequired: true,
      min: 1,
    }
    const allInputsValidatable = [titleValidatableString, descriptionValidatableString, peopleValidatableNumber];
    if (allInputsValidatable.every(validate)) {
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
class ProjectItem extends Template<HTMLLIElement, HTMLElement> {
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
  }

  renderComponent() {
    this._element.querySelector('h2')!.textContent = this.project.title;
    this._element.querySelector('h3')!.textContent = this.people;
    this._element.querySelector('p')!.textContent = this.project.description;
  }
}


/* 
  ProjectList class
*/
class ProjectList extends Template<HTMLDivElement, HTMLElement> {
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
}


/*
  Running the scripts
*/
const pendingProjectList = new ProjectList('pending');
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
const projectInput = new ProjectInput();