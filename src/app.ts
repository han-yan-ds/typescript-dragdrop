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
  ProjectInput class
*/
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  _element: HTMLFormElement;

  titleInput: HTMLInputElement; descriptionInput: HTMLInputElement; peopleInput: HTMLInputElement;

  constructor() {
    /* 
      Below, notice a couple things here:
      1) I added "!" to tell TypeScript that this element cannot be null
      2) I casted it to an HTML___Element type, so that I can tell TS 
        that this.___Element will definitely have required properties
    */
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('input-section')! as HTMLDivElement;
    /*
      Below, notice:
      1) document.importNode copies a node (and if true, its children)
      2) this._element is a copy of the node's child, which is a form that I want to copy and insert somewhere else
    */
    const importedNode = document.importNode(this.templateElement.content, true); // <template><form><form/></template>
    this._element = importedNode.firstElementChild! as HTMLFormElement; // <form/>
    this._element.id = 'user-input'; // adding a new ID for css purposes
    /*
    Below is assigning the contents of the form inputs to this instance's properties
    */
    this.titleInput = this._element.querySelector('#title')! as HTMLInputElement; // querySelector instead of getElementById... for a node instead of document
    this.descriptionInput = this._element.querySelector('#description')! as HTMLInputElement;
    this.peopleInput = this._element.querySelector('#people')! as HTMLInputElement;
   
    this.attach();
    this.attachSubmitHandler();
  }

  /* Attaching methods */
  private attach() {
    // inserts right after the opening tag of the hostElement
    this.hostElement.insertAdjacentElement('afterbegin', this._element);
  }

  private attachSubmitHandler() {
    this._element.addEventListener('submit', this.submitHandler);
  }

  /* Button-Click methods */
  @AutoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInputs = this.gatherUserInput();
    console.log(userInputs);
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
// class ProjectItem {
//   constructor() {}
// }


/* 
  ProjectList class
*/
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  _element: HTMLElement;

  constructor(private listName: 'pending' | 'active' | 'finished') { // I could make this more specific by only allowing certain strings, eg: "active" or "finished"
   this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
   this.hostElement = document.getElementById('project-list-section')! as HTMLDivElement;

   const importedNode = document.importNode(this.templateElement.content, true); // <template><section><section/></template>
   this._element = importedNode.firstElementChild! as HTMLElement; // <section/>
   this._element.id = `${listName}-projects`;
   /*
   Below is assigning the contents of the form inputs to this instance's properties
   */
    this.attach();
    this.renderListSkeleton();
  }

  private renderListSkeleton() {
    this._element.querySelector('ul')!.id = `${this.listName}-projects-list`;
    this._element.querySelector('h2')!.textContent = `${this.listName.toUpperCase()} PROJECTS`;
  }

  private attach() {
    // inserts right after the opening tag of the hostElement
    this.hostElement.insertAdjacentElement('beforeend', this._element);
  }
}


/*
  Running the scripts
*/
const pendingProjectList = new ProjectList('pending');
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
const projectInput = new ProjectInput();