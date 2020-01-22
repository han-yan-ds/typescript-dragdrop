/**
 * Project Input class
 */
namespace App {

  export class ProjectInput extends Template<HTMLDivElement, HTMLFormElement> {
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
}
