// clippy.js
class Clippy {
    /**
     * @param {Object} options - Configuration for Clippy
     * @param {string} [options.defaultImage] - Default Clippy image path
     * @param {string} [options.defaultText] - Default text in the speech bubble
     * @param {string} [options.bubblePosition] - "top" or "bottom" (where the bubble goes relative to Clippy)
     */
    constructor(options = {}) {
        this.defaultImage = options.defaultImage || 'css/images/clippy.gif';
        this.defaultText = options.defaultText || 'Hello from Clippy!';
        this.bubblePosition = options.bubblePosition || 'bottom';
        // (Set default bubble below the image, but you can choose "top" if you prefer.)

        this.clippyDiv = null;
        this.init();
    }

    /**
     * Creates the DOM structure and appends it to <body>.
     */
    init() {
        this.clippyDiv = document.createElement('div');
        this.clippyDiv.classList.add('clippy-container');
        // Start hidden
        this.clippyDiv.style.display = 'none';
        this.clippyDiv.style.position = 'absolute';
        this.clippyDiv.style.zIndex = '9999';

        let bubbleHTML = `
      <div class="clippy-speech">
        <p>${this.defaultText}</p>
        <button class="clippy-dismiss">Got it!</button>
      </div>
    `;

        const contentHTML = (this.bubblePosition === 'top')
            ? `${bubbleHTML}<img class="clippy-img" src="${this.defaultImage}" alt="Mascot">`
            : `<img class="clippy-img" src="${this.defaultImage}" alt="Mascot">${bubbleHTML}`;

        this.clippyDiv.innerHTML = `
      <div class="clippy-wrapper">
        ${contentHTML}
      </div>
    `;

        document.body.appendChild(this.clippyDiv);

        // Dismiss button
        const dismissBtn = this.clippyDiv.querySelector('.clippy-dismiss');
        dismissBtn.addEventListener('click', () => this.hide());
    }

    /**
     * Updates the Clippy image.
     */
    setImage(imagePath) {
        const clippyImg = this.clippyDiv.querySelector('.clippy-img');
        if (clippyImg) {
            clippyImg.src = imagePath;
        }
    }

    /**
     * Updates the speech bubble text.
     */
    setText(newText) {
        const textP = this.clippyDiv.querySelector('.clippy-speech p');
        if (textP) {
            textP.innerHTML = newText;
        }
    }

    /**
     * Show Clippy at a specific (x, y) coordinate.
     * @param {number} x - The left position in pixels
     * @param {number} y - The top position in pixels
     */
    showAtCoordinates(x, y) {
        if (!this.clippyDiv) return;

        this.clippyDiv.style.display = 'block';
        this.clippyDiv.style.left = `${x}px`;
        this.clippyDiv.style.top = `${y}px`;
    }

    /**
     * Show Clippy relative to an element, placing the bubble below or above the image.
     * By default, if bubble is "bottom," we place Clippy's top edge near the element's bottom.
     * If bubble is "top," we place Clippy's bottom edge near the element's top.
     *
     * @param {Element} targetElement - The DOM element
     * @param {Object} offsets - { offsetX: number, offsetY: number }
     *        Additional horizontal/vertical spacing
     */
    showRelativeToElement(targetElement, offsets = { offsetX: 0, offsetY: 10 }) {
        if (!targetElement || !this.clippyDiv) return;

        const rect = targetElement.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        // Make Clippy visible
        this.clippyDiv.style.display = 'block';

        // Determine Clippy's width/height
        const clippyWidth = this.clippyDiv.offsetWidth;
        const clippyHeight = this.clippyDiv.offsetHeight;

        let xPos = rect.left + scrollX + offsets.offsetX;
        let yPos;

        if (this.bubblePosition === 'bottom') {
            yPos = rect.bottom + scrollY + offsets.offsetY;
        } else {
            yPos = rect.top + scrollY - clippyHeight - offsets.offsetY;
        }

        // xPos = rect.left + scrollX + (rect.width / 2) - (clippyWidth / 2);

        this.clippyDiv.style.left = `${xPos}px`;
        this.clippyDiv.style.top = `${yPos}px`;
    }

    /**
     * Simply show Clippy at its current position (no repositioning).
     */
    show() {
        if (this.clippyDiv) {
            this.clippyDiv.style.display = 'block';
        }
    }

    /**
     * Hide Clippy.
     */
    hide() {
        if (this.clippyDiv) {
            this.clippyDiv.style.display = 'none';
        }
    }
}

window.Clippy = Clippy;