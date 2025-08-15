// @ts-check

import { UIComponent } from "./UIComponent.js";

class GameRow extends UIComponent {
  /** @type { HTMLAnchorElement } */
  container;
  /** @type { HTMLElement } */
  nameElement;
  /** @type { HTMLElement } */
  scoreElement;
  /** @type { HTMLImageElement } */
  icon;
  /**
   * @param { string } name
   * @param { string } colour
   * @param { string } link
   * @param { string } iconSRC
   * @param { string } iconAlt
   * @param { number } [highScore]
   * @param { boolean } [isMobile]
   * @param { boolean } [hasMobileLink]
   */
  constructor(
    name,
    colour,
    link,
    iconSRC,
    iconAlt,
    highScore,
    isMobile,
    hasMobileLink
  ) {
    super("gameRow");

    // @ts-expect-error this is correct - check the template
    this.container = this.getElementById("container");
    this.nameElement = this.getElementById("name");
    this.scoreElement = this.getElementById("score");
    // @ts-expect-error this is correct - check the template
    this.icon = this.getElementById("icon");

    this.container.style.backgroundColor = colour;
    this.container.href = link;
    this.container.id = "";

    this.nameElement.textContent = name;
    this.nameElement.id = "";

    if (highScore !== undefined) {
      this.scoreElement.textContent = `High Score: ${highScore}`;
    } else {
      this.scoreElement.style.display = "none";
    }

    this.scoreElement.id = "";

    this.icon.src = iconSRC;
    this.icon.alt = iconAlt;
    this.icon.id = "";

    if (isMobile && hasMobileLink) {
      this.container.href += "Mobile";
    }
  }
}

export { GameRow };
