/**
 * Importing namespaces
 */
/// <reference path='./drag-drop.ts'/> 
/// <reference path='./decorators.ts'/>
/// <reference path='./validation.ts'/>
/// <reference path='./templates.ts'/>
/// <reference path='./project-object.ts'/>
/// <reference path='./project-state.ts'/>
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