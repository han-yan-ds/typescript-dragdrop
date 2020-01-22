/**
 * HTML Templates
 */
namespace App {
  export abstract class Template<H extends HTMLElement, E extends HTMLElement> {
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

}