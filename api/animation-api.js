/**
 * Animation API for handling reversible CSS animations
 * Supports toggling open/close states with automatic reversal
 */
class AnimationAPI {
  /**
   * Toggle animation state for an element
   * @param {HTMLElement} element - The element to animate
   * @param {string} animationName - Name of the animation (e.g., 'slide', 'fade')
   * @param {boolean} isOpen - Whether to open or close
   * @param {Object} options - Additional options
   * @param {number} options.duration - Animation duration in seconds (default: 0.5)
   * @param {string} options.easing - CSS easing function (default: 'ease-in-out')
   */
  static toggle(element, animationName, isOpen, options = {}) {
    if (!element) return;

    const { duration = 0.5, easing = 'ease-in-out' } = options;

    // Remove existing animation classes
    element.classList.remove('open', 'close');

    // Set animation properties
    element.style.animationDuration = `${duration}s`;
    element.style.animationTimingFunction = easing;

    // Add the appropriate class
    if (isOpen) {
      element.classList.add('open');
    } else {
      element.classList.add('close');
    }

    // Optional: Listen for animation end to clean up
    const onAnimationEnd = () => {
      element.removeEventListener('animationend', onAnimationEnd);
      // Clean up if needed
    };
    element.addEventListener('animationend', onAnimationEnd);
  }

  /**
   * Animate element to open state
   * @param {HTMLElement} element
   * @param {string} animationName
   * @param {Object} options
   */
  static open(element, animationName, options = {}) {
    this.toggle(element, animationName, true, options);
  }

  /**
   * Animate element to close state
   * @param {HTMLElement} element
   * @param {string} animationName
   * @param {Object} options
   */
  static close(element, animationName, options = {}) {
    this.toggle(element, animationName, false, options);
  }

  /**
   * Initialize toggle behavior for an element (e.g., button click)
   * @param {HTMLElement} trigger - The trigger element
   * @param {HTMLElement} target - The element to animate
   * @param {string} animationName
   * @param {Object} options
   */
  static initToggle(trigger, target, animationName, options = {}) {
    let isOpen = false;
    trigger.addEventListener('click', () => {
      isOpen = !isOpen;
      this.toggle(target, animationName, isOpen, options);
    });
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationAPI;
}

// Make available globally for userscript
window.AnimationAPI = AnimationAPI;