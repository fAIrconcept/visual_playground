export class Input {
  constructor(el) {
    this.dragDX = 0;
    this.lastX = null;

    el.addEventListener("pointerdown", e => {
      el.setPointerCapture(e.pointerId);
      this.lastX = e.clientX;
    });

    el.addEventListener("pointermove", e => {
      if (this.lastX == null) return;
      this.dragDX += e.clientX - this.lastX;
      this.lastX = e.clientX;
    });

    const end = () => { this.lastX = null; };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }
}
