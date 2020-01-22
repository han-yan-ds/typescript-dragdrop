/**
 * Drag Drop Functionality here
 */
namespace DragDrop {
  export interface Draggable {
    attachDraggableHandler(): void;
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
  }
  
  export interface Droppable {
    attachDroppableHandler(): void;
    dragOnHandler(event: DragEvent): void;
    dragOffHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
  }
}
