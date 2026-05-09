export class TextAnimator {
  constructor(selector, options = {}) {
    this.selector = selector;
    this.options = options;
    this.init();
  }

  init() {
    const config = {
      speed: this.options.speed || 600,
      stagger: this.options.stagger || 50,
      direction: this.options.direction || "top",
      preset: this.options.preset || "fade",
      blur: this.options.blur ?? null,
      intensity: this.options.intensity || 8,
      easing: this.options.easing || ((t) => 1 - Math.pow(1 - t, 3)),
      custom: this.options.custom || null,
      trigger: this.options.trigger || "load",
      loop: this.options.loop || false,
      reverse: this.options.reverse || false,
    };

    const presets = {
      fade: {
        blur: 6,
        scale: 0.9,
      },

      slide: {
        blur: 0,
        scale: 1,
      },

      glitch: {
        blur: 0,
        scale: 1,
        glitch: true,
      },
    };

    const elements = document.querySelectorAll(this.selector);

    elements.forEach((el) => {
      // ✅ ORIGINAL HTML SAVE
      const originalHTML = el.innerHTML;

      function runAnimation() {
        // ✅ RESET ORIGINAL HTML
        el.innerHTML = originalHTML;

        const letters = [];

        const preset = presets[config.preset] || presets.fade;

        const distance = config.intensity * 3;

        let initial = "";

        if (config.direction === "top") {
          initial = `translateY(${distance}px)`;
        }

        if (config.direction === "bottom") {
          initial = `translateY(-${distance}px)`;
        }

        if (config.direction === "left") {
          initial = `translateX(-${distance}px)`;
        }

        if (config.direction === "right") {
          initial = `translateX(${distance}px)`;
        }

        const blurValue =
          config.blur !== null ? config.blur : preset.blur;

        // ==================================================
        // ✅ SPLIT ONLY TEXT NODES
        // ==================================================

        function splitText(node) {
          // TEXT NODE
          if (node.nodeType === 3) {
            const text = node.textContent;

            const fragment = document.createDocumentFragment();

            Array.from(text).forEach((char) => {
              const span = document.createElement("span");

              span.textContent =
                char === " " ? "\u00A0" : char;

              span.style.display = "inline-block";
              span.style.whiteSpace = "pre";
              span.style.margin = "0";
              span.style.padding = "0";
              span.style.opacity = 0;

              if (!preset.glitch && !config.custom) {
                span.style.transform =
                  `${initial} scale(${preset.scale})`;

                span.style.filter =
                  `blur(${blurValue}px)`;
              }

              fragment.appendChild(span);

              letters.push(span);
            });

            node.parentNode.replaceChild(fragment, node);
          }

          // ELEMENT NODE
          else if (node.nodeType === 1) {
            Array.from(node.childNodes).forEach(splitText);
          }
        }

        splitText(el);

        // ==================================================
        // ✅ ANIMATION
        // ==================================================

        letters.forEach((span, i) => {
          const index = config.reverse
            ? letters.length - i - 1
            : i;

          const delay = index * config.stagger;

          // ==========================================
          // CUSTOM
          // ==========================================

          if (typeof config.custom === "function") {
            let start = null;

            function animate(t) {
              if (!start) start = t;

              const elapsed = t - start;

              if (elapsed < delay) {
                return requestAnimationFrame(animate);
              }

              const progress = Math.min(
                (elapsed - delay) / config.speed,
                1
              );

              config.custom(progress, span, i);

              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            }

            requestAnimationFrame(animate);

            return;
          }

          // ==========================================
          // GLITCH
          // ==========================================

          if (preset.glitch) {
            setTimeout(() => {
              span.style.opacity = 1;

              let start = null;

              function glitchFrame(t) {
                if (!start) start = t;

                const elapsed = t - start;

                const progress = Math.min(
                  elapsed / config.speed,
                  1
                );

                const jitterX =
                  (Math.random() - 0.5) *
                  config.intensity *
                  2;

                const jitterY =
                  (Math.random() - 0.5) *
                  config.intensity;

                span.style.transform =
                  `translate(${jitterX}px, ${jitterY}px)`;

                span.style.textShadow = `
                  ${jitterX}px 0px rgba(255,0,0,0.8),
                  ${-jitterX}px 0px rgba(0,255,255,0.8)
                `;

                span.style.opacity =
                  Math.random() > 0.3 ? 1 : 0.4;

                if (progress < 1) {
                  requestAnimationFrame(glitchFrame);
                } else {
                  span.style.transform = "translate(0,0)";
                  span.style.textShadow = "none";
                  span.style.opacity = 1;
                }
              }

              requestAnimationFrame(glitchFrame);
            }, delay);
          }

          // ==========================================
          // NORMAL ANIMATION
          // ==========================================

          else {
            let start = null;

            function animate(t) {
              if (!start) start = t;

              const elapsed = t - start;

              if (elapsed < delay) {
                return requestAnimationFrame(animate);
              }

              const progress = Math.min(
                (elapsed - delay) / config.speed,
                1
              );

              const ease = config.easing(progress);

              const move = distance * (1 - ease);

              let transform = "";

              if (config.direction === "top") {
                transform = `translateY(${move}px)`;
              }

              if (config.direction === "bottom") {
                transform = `translateY(${-move}px)`;
              }

              if (config.direction === "left") {
                transform = `translateX(${-move}px)`;
              }

              if (config.direction === "right") {
                transform = `translateX(${move}px)`;
              }

              span.style.opacity = ease;

              span.style.transform =
                `${transform} scale(${
                  preset.scale - 0.2 + 0.2 * ease
                })`;

              span.style.filter =
                `blur(${
                  blurValue *
                  (1 - ease) *
                  (config.intensity / 8)
                }px)`;

              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            }

            requestAnimationFrame(animate);
          }
        });

        // ==================================================
        // LOOP
        // ==================================================

        if (config.loop) {
          setTimeout(() => {
            runAnimation();
          }, config.speed + letters.length * config.stagger + 500);
        }
      }

      // ==================================================
      // TRIGGER
      // ==================================================

      if (config.trigger === "scroll") {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runAnimation();

              observer.unobserve(el);
            }
          });
        });

        observer.observe(el);
      }

      else if (config.trigger === "hover") {
        el.addEventListener("mouseenter", runAnimation);
      }

      else {
        runAnimation();
      }
    });
  }
}