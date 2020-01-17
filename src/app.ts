// import {AutoBind} from './autobind';
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


// import as a utility
function isInputOccupied(inpStr: string): boolean {
  return (inpStr.trim().length !== 0);
}

function TransformFunctionToArrayFunc<T>(boolFunc: (x: T)=>boolean) {
  // FANTASTIC CASE STUDY on using generic types in TypeScript!
  // only true if boolFunc(each item in the array) is true... I can make an "OR" version later
  return function(arr: T[]) {
    return arr.reduce((endBool: boolean, item: T) => {
      return endBool && boolFunc(item);
    }, true);
  }
}

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
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
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
  }

  private gatherUserInput(): [string, string, number] | void {
    const allInputStrings: [string, string, any] = [this.titleInput.value, this.descriptionInput.value, this.peopleInput.value];
    const testAllInputsOccupied: Function = TransformFunctionToArrayFunc(isInputOccupied);
    if (testAllInputsOccupied(allInputStrings)) {
      allInputStrings[2] = +allInputStrings[2]; // convert last string to number before returning
      return allInputStrings;
    }
    return; // not all are occupied
  }
}

const projectInput = new ProjectInput();