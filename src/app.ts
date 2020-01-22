/**
 * Importing namespaces
 */
/// <reference path='./utilities/drag-drop.ts'/> 
/// <reference path='./utilities/decorators.ts'/>
/// <reference path='./utilities/validation.ts'/>
/// <reference path='./components/templates.ts'/>
/// <reference path='./project-state/project-object.ts'/>
/// <reference path='./project-state/project-state.ts'/>
/// <reference path='./components/project-list.ts'/>
/// <reference path='./components/project-input.ts'/>
/// <reference path='./components/project-item.ts'/>

namespace App {
  /**
   * Instantiating the lists and the inputs
   */
  new ProjectList('pending');
  new ProjectList('active');
  new ProjectList('finished');
  new ProjectInput();
}