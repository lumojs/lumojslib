export class Cursor {
  constructor(options = {}) {
    this.instance = this.initCursor(options);
  }

  initCursor(options = {}) {
    const config = {
      cursorType: options.cursorType || "dot",
      color: options.color || "#38bdf8",
      trailColor: options.trailColor || "rgba(56,189,248,0.5)",
      size: options.size || 10,
      trailSize: options.trailSize || 6,
      trailCount: options.trailCount || 8,
      hideDefaultCursor: options.hideDefaultCursor || false,
      clickEffect: options.clickEffect ?? true,
      hoverGrow: options.hoverGrow ?? true,

      clickSize: options.clickSize || 80,
      clickColor: options.clickColor || options.color || "#38bdf8",
      clickDuration: options.clickDuration || 600,
      clickBorderWidth: options.clickBorderWidth || 2,

      magnetic: options.magnetic || false,
      hoverSelector: options.hoverSelector || "button, a",
    };

    if (config.hideDefaultCursor) {
      document.body.style.cursor = "none";
      document.documentElement.style.cursor = "none";

      const all = document.querySelectorAll("*");
      all.forEach((el) => {
        el.style.cursor = "none";
      });
    } else {
      document.body.style.cursor = "auto";
      document.documentElement.style.cursor = "auto";
    }

    // ===== CURSOR =====
    const cursor = document.createElement("div");
    cursor.style.position = "fixed";
    cursor.style.pointerEvents = "none";
    cursor.style.zIndex = "9999";
    cursor.style.transition = "transform 0.2s ease";

    if (config.cursorType === "dot") {
      cursor.style.width = config.size + "px";
      cursor.style.height = config.size + "px";
      cursor.style.background = config.color;
      cursor.style.borderRadius = "50%";
      cursor.style.boxShadow = `0 0 10px ${config.color}, 0 0 20px ${config.color}`;
    } else {
      cursor.style.width = config.size * 2 + "px";
      cursor.style.height = config.size * 2 + "px";
      cursor.style.border = `2px solid ${config.color}`;
      cursor.style.borderRadius = "50%";
      cursor.style.boxShadow = `0 0 10px ${config.color}, 0 0 25px ${config.color}`;
    }

    document.body.appendChild(cursor);

    // ===== TRAIL =====
    const trails = [];
    for (let i = 0; i < config.trailCount; i++) {
      const t = document.createElement("div");
      t.style.position = "fixed";
      t.style.width = config.trailSize + "px";
      t.style.height = config.trailSize + "px";
      t.style.background = config.trailColor;
      t.style.borderRadius = "50%";
      t.style.pointerEvents = "none";
      t.style.zIndex = "9998";
      document.body.appendChild(t);
      trails.push({ el: t, x: 0, y: 0 });
    }

    let mouseX = 0,
      mouseY = 0;
    let curX = 0,
      curY = 0;
    let lastX = 0,
      lastY = 0;

    function mouseMoveHandler(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    document.addEventListener("mousemove", mouseMoveHandler);

    function animate() {
      const speed = Math.hypot(mouseX - lastX, mouseY - lastY);
      const ease = speed > 20 ? 0.08 : 0.2;

      curX += (mouseX - curX) * ease;
      curY += (mouseY - curY) * ease;

      const offset =
        config.cursorType === "dot" ? config.size / 2 : config.size;
      cursor.style.left = curX - offset + "px";
      cursor.style.top = curY - offset + "px";

      let x = curX;
      let y = curY;

      trails.forEach((trail) => {
        trail.x += (x - trail.x) * 0.25;
        trail.y += (y - trail.y) * 0.25;

        trail.el.style.left = trail.x - config.trailSize / 2 + "px";
        trail.el.style.top = trail.y - config.trailSize / 2 + "px";

        x = trail.x;
        y = trail.y;
      });

      lastX = mouseX;
      lastY = mouseY;

      animationId = requestAnimationFrame(animate);
    }

    let animationId = requestAnimationFrame(animate);

    // ===== CLICK =====
    function clickHandler(e) {
      if (!config.clickEffect) return;

      const ripple = document.createElement("div");

      ripple.style.position = "fixed";
      ripple.style.left = "0px";
      ripple.style.top = "0px";
      ripple.style.width = config.clickSize + "px";
      ripple.style.height = config.clickSize + "px";
      ripple.style.border = `${config.clickBorderWidth}px solid ${config.clickColor}`;
      ripple.style.borderRadius = "50%";
      ripple.style.pointerEvents = "none";
      ripple.style.opacity = "1";

      ripple.style.boxShadow = `
      0 0 10px ${config.clickColor},
      0 0 20px ${config.clickColor},
      0 0 40px ${config.clickColor}
    `;

      ripple.style.transform = `
      translate(${e.clientX - config.clickSize / 2}px,
                ${e.clientY - config.clickSize / 2}px)
      scale(0)
    `;

      ripple.style.transition = `
      transform ${config.clickDuration}ms ease,
      opacity ${config.clickDuration}ms ease
    `;

      document.body.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.transform = `
        translate(${e.clientX - config.clickSize / 2}px,
                  ${e.clientY - config.clickSize / 2}px)
        scale(1)
      `;
        ripple.style.opacity = "0";
      });

      setTimeout(() => ripple.remove(), config.clickDuration);
    }

    document.addEventListener("click", clickHandler);

    // ===== HOVER =====
    const elements = document.querySelectorAll(config.hoverSelector);

    elements.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        if (config.hoverGrow) cursor.style.transform = "scale(2)";
      });

      el.addEventListener("mouseleave", () => {
        cursor.style.transform = "scale(1)";
        el.style.transform = "translate(0,0)";
      });

      el.addEventListener("mousemove", (e) => {
        if (!config.magnetic) return;

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const moveX = (e.clientX - centerX) * 0.2;
        const moveY = (e.clientY - centerY) * 0.2;

        el.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    });

    // destroy
    function destroy() {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("click", clickHandler);
      cancelAnimationFrame(animationId);

      cursor.remove();
      trails.forEach((t) => t.el.remove());

      elements.forEach((el) => (el.style.transform = ""));
      document.body.style.cursor = "auto";
      document.documentElement.style.cursor = "auto";

      document.querySelectorAll("*").forEach((el) => {
        el.style.cursor = "";
      });
    }

    return { destroy };
  }

  destroy() {
    this.instance.destroy();
  }
}
