/**
 * Project Item class
 */
namespace App {

  export class ProjectItem extends Template<HTMLLIElement, HTMLElement> implements DragDrop.Draggable {
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
}