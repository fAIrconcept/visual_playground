export class Input {
  constructor(el) {
    this.dx = 0;
    this.last = null;
    this.pointer = [0, 0];
    el.onpointerdown = (e) => {
      el.setPointerCapture(e.pointerId);
      this.last = e.clientX;
    };
    el.onpointermove = (e) => {
      this.pointer = [e.clientX, e.clientY];
      if (this.last !== null) {
        this.dx += e.clientX - this.last;
        this.last = e.clientX;
      }
    };
    el.onpointerup = el.onpointercancel = () => (this.last = null);
  }
  consumeDX() {
    const d = this.dx;
    this.dx = 0;
    return d;
  }
}
