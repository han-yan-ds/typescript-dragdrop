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


  private attach() {
    // inserts right after the opening tag of the hostElement
    this.hostElement.insertAdjacentElement('afterbegin', this._element);
  }


  private attachSubmitHandler() {
    this._element.addEventListener('submit', this.submitHandler.bind(this));
  }

  private submitHandler(event: Event) {
    event.preventDefault();
    console.log(this.titleInput.value);
  }
}

const projectInput = new ProjectInput();