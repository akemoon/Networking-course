export class ContextMenu {
  constructor(container) {
    this.el = container;
    this.items = [];
    this.onHide = null;
    this._outside = (e) => {
      if (!this.el.contains(e.target)) this.hide();
    };
  }

  setItems(items) { this.items = items; }

  show(x, y) {
    this.render();
    this.el.style.left = `${x}px`;
    this.el.style.top = `${y}px`;
    this.el.hidden = false;
    setTimeout(() => document.addEventListener('mousedown', this._outside, { once: true }));
  }

  hide() {
    this.el.hidden = true;
    if (this.onHide) this.onHide();
  }

  render() {
    this.el.innerHTML = '';
    for (const item of this.items) {
      const btn = document.createElement('button');
      btn.textContent = item.label;
      btn.addEventListener('click', () => { this.hide(); item.onClick(); });
      this.el.appendChild(btn);
    }
  }
}

