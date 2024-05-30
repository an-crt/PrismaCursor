class PrismaCursor {
  constructor() {
    this.initProperties();
    this.initCursor();
    this.addEventListeners();
    this.handleScroll();
  }

  initProperties() {
    this.mouseX = 0;
    this.mouseY = 0;
    this.drag = 0.7;
    this.reset = {};
    this.onScreenXS = false;
    this.currentElement = null;
    this.xTo;
    this.yYo;

    this.cursorStyles = {
      position: 'fixed',
      pointerEvents: 'none',
      top: 0,
      left: 0,
      visibility: 'hidden',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      display: 'grid',
      placeItems: 'center',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transformOrigin: 'center',
      overflow: 'hidden',
    };

    this.textNodeStyles = {
      textTransform: 'capitalize',
      transition: '100ms',
      position: 'absolute',
    };

  }

  initCursor() {
    this.cursor = document.createElement('div');
    this.textNode = document.createElement('span');
    this.vNode = document.createElement('img')

    this.cursor.classList.add('cursor');
    this.textNode.classList.add('textNode');
    this.vNode.classList.add('visuals')
    this.cursor.appendChild(this.textNode);
    this.cursor.appendChild(this.vNode)
    document.body.appendChild(this.cursor);

    Object.assign(this.cursor.style, this.cursorStyles);
    Object.assign(this.textNode.style, this.textNodeStyles);
  }

  addCursor(defaults = {}, drag = 0.7, onScreenXS = false) {
    this.drag = drag;
    this.onScreenXS = onScreenXS;
    this.reset = defaults;

    const applyDefaults = () => {
      gsap.set(this.cursor, defaults);
      gsap.set(this.textNode, { opacity: 1 });
      this.cursor.style.display = this.checkScreenSize() ? 'none' : 'grid';
    };

    window.addEventListener('load', applyDefaults);
    window.addEventListener('resize', applyDefaults);
    document.addEventListener('mouseleave', () => gsap.to(this.cursor, { opacity: 0, delay: 5 }));
    document.addEventListener('mouseenter', () => gsap.to(this.cursor, { opacity: 1 }));
  }

  moveCursor(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    gsap.to(this.cursor, {
      x: this.mouseX,
      y: this.mouseY,
      visibility: 'visible',
      force3D: true,
      ease: 'expo',
      duration: this.drag,
    });
  }

  addEventListeners() {
    ['mousemove', 'touchmove', 'dragover', 'dragstart', 'dragleave'].forEach(event => {
      document.addEventListener(event, (e) => this.moveCursor(e));
    });
  }

  handleScroll() {
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (event) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
    });

    window.addEventListener('scroll', () => {
      const elementUnderCursor = document.elementFromPoint(cursorX, cursorY);

      if (this.currentElement && (!elementUnderCursor || !elementUnderCursor.classList.contains('prisma'))) {
        this.resetCursorStyles();
        this.currentElement = null;
      }

      if (elementUnderCursor && elementUnderCursor.classList.contains('prisma')) {
        this.currentElement = elementUnderCursor;
      }
    });
  }

  resetCursorStyles() {
    gsap.to(this.cursor, {
      opacity: 1,
      scale: 1,
      background: this.reset.background,
      mixBlendMode: 'normal',
      clipPath: 'none',
      overflow: 'hidden',
      borderRadius: this.reset.borderRadius,
      outline: 'none',
      border: 'none',
      animation: 'none',
      rotate: 0,
      outlineOffset: 0,
    });
    this.decOpacity()
  }

  addHover(d = 0.4) {
    document.querySelectorAll('.prisma').forEach((node) => {
      node.addEventListener('mouseenter', (e) => this.handleMouseMoveOnNode(e, node, d));
      node.addEventListener('mousemove', (e) => this.handleMouseMoveOnNode(e, node, d));
      node.addEventListener('mouseleave', () => this.handleMouseLeaveOnNode(node, d));
    });
  }

  handleMouseMoveOnNode(e, node, d) {
    if ('magnetic' in node.dataset && !this.checkScreenSize()) {
      const { left, top, width, height } = node.getBoundingClientRect();
      const y = (e.clientY - top - height / 2) * ('magneticIntencity' in node.dataset ? node.dataset.magneticIntencity / 38 : 0.08);
      const x = (e.clientX - left - width / 2) * ('magneticIntencity' in node.dataset ? node.dataset.magneticIntencity / 38 : 0.08);

      gsap.to(node, {
        y: y,
        x: x,
        force3D: true,
        duration: 0.5,
        overwrite: true,
      });
    }
    if ('color' in node.dataset) {
      gsap.to(this.textNode, { color: node.dataset.color })
    }
    const datasetCopy = { ...node.dataset };
    delete datasetCopy.magnetic;
    delete datasetCopy.text;
    delete datasetCopy.objectsrc;
    delete datasetCopy.magneticEase;
    delete datasetCopy.magneticIntencity;

    gsap.to(this.cursor, d, datasetCopy);
  }

  handleMouseLeaveOnNode(node, d) {
    gsap.to(this.cursor, d, {
      opacity: 1,
      scale: 1,
      background: this.reset.background,
      mixBlendMode: 'normal',
      clipPath: 'none',
      overflow: 'hidden',
      borderRadius: this.reset.borderRadius,
      outline: 'none',
      border: 'none',
      animation: 'none',
      rotate: 0,
      outlineOffset: 0,
    });
    if ('magnetic' in node.dataset) {
      gsap.to(node, 0.8, {
        x: 0,
        y: 0,
        ease: node.dataset.magneticEase === 'elastic' ? 'elastic.out' : node.dataset.magneticEase || 'expo',
        force3D: true,
      });
    }
  }

  checkScreenSize() {
    return this.onScreenXS && window.matchMedia('(max-width: 800px)').matches;
  }

  addStyles(styles = {}, d = 0.4) {
    gsap.to(this.cursor, d, styles);
  }

  addText({ fontSize = 3, color = 'black', fontFamily = 'sans-serif', fontWeight = 200 } = {}, maxl = 5) {
    const textElements = document.querySelectorAll('.prisma-text');
    Object.assign(this.textNode.style, {
      fontSize: fontSize * 2 + 'px',
      fontWeight: fontWeight,
      color: color,
      fontFamily: fontFamily
    });
    textElements.forEach((element) => {
      if ('text' in element.dataset && !this.checkScreenSize()) {
        element.addEventListener('mousemove', () => this.updateCursorText(element, maxl));
        element.addEventListener('mouseleave', () => this.clearCursorText());
      }
      if ('objectsrc' in element.dataset && !this.checkScreenSize()) {
        element.addEventListener('mousemove', () => this.updateCursorText(element, maxl));
        element.addEventListener('mouseleave', () => this.clearCursorText());
      }
      window.addEventListener('resize', () => {
        if ('text' in element.dataset && !this.checkScreenSize()) {
          element.addEventListener('mousemove', () => this.updateCursorText(element, maxl));
          element.addEventListener('mouseleave', () => this.clearCursorText());
        }
        if ('objectsrc' in element.dataset && !this.checkScreenSize()) {
          element.addEventListener('mousemove', () => this.updateCursorText(element, maxl));
          element.addEventListener('mouseleave', () => this.clearCursorText());
        }
      });
    });
  }

  updateCursorText(element, maxl) {
    this.incOpacity()
    if ('text' in element.dataset) {
      this.setText(this.truncateString(element.dataset.text, maxl));
      gsap.to(this.vNode, { opacity: 0, duration: 0.3 });
    } else if ('objectsrc' in element.dataset) {
      Object.assign(this.vNode.style, {
        borderRadius: this.reset.borderRadius,
        maxWidth: '100.09%',
      })
      gsap.to(this.textNode, { opacity: 0, duration: 0.3 });
      this.setVisuals(element.dataset.objectsrc)
    }
  }

  clearCursorText() {
    this.decOpacity()
  }

  setText(text) {
    this.textNode.innerHTML = text;
  }

  setVisuals(src) {
    this.vNode.src = src
    console.log(src)
  }

  truncateString(str, maxLength) {
    return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
  }

  incOpacity(o = 1) {
    gsap.to(this.textNode, { opacity: o, duration: 0.3 });
    gsap.to(this.vNode, { opacity: o, duration: 0.3 });
  }

  decOpacity(o = 0) {
    gsap.to(this.textNode, { opacity: o, duration: 0.3 });
    gsap.to(this.vNode, { opacity: o, duration: 0.3 });
  }

  killCursor() {
    document.body.removeChild(this.cursor)
    gsap.killTweensOf(this.cursor)
    document.querySelectorAll('.prisma').forEach(node => {
      node.removeEventListener('mouseenter', this.handleMouseMoveOnNode);
      node.removeEventListener('mouseleave', this.handleMouseLeaveOnNode);
      node.classList.remove('prisma')
      node.classList.remove('prisma-text')
      gsap.killTweensOf(node);
      delete node.dataset.magnetic;
      delete node.dataset.text;
      delete node.dataset.objectsrc;
      delete node.dataset.magneticEase;
      delete node.dataset.magneticIntencity;
    });

  }

}