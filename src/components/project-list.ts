/**
 * Project List class
 */
namespace App {

  export class ProjectList extends Template<HTMLDivElement, HTMLElement> implements DragDrop.Droppable {
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
}