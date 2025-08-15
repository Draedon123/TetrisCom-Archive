// @ts-check

class UIComponent {
  /** @type { DocumentFragment } */
  content;
  /** @type { boolean } */
  mounted;
  /**
   * @param { string } templateID
   */
  constructor(templateID) {
    /** @type { HTMLTemplateElement } */
    // @ts-expect-error selector ensures HTMLTemplateElement
    const template = document.querySelector(`template#${templateID}`);
    if (template === null) {
      throw new Error(`Could not find template with ID "${templateID}"`);
    }

    this.content = UIComponent.cloneTemplate(template);
    this.mounted = false;
  }

  /**
   * @param { Node } parent
   */
  mount(parent) {
    if (this.mounted) {
      console.warn("Component already mounted");
      return;
    }

    parent.appendChild(this.content);
    this.mounted = true;
  }

  /**
   * @param { string } elementId
   * @returns { HTMLElement }
   */
  getElementById(elementId) {
    const element = this.content.getElementById(elementId);
    if (element === null) {
      throw new Error(`Could not find element with ID ${elementId}`);
    }

    return element;
  }

  /**
   * @param { HTMLTemplateElement } template
   * @returns { DocumentFragment }
   */
  static cloneTemplate(template) {
    // @ts-expect-error cloning template returns DocumentFragment... probably
    return template.content.cloneNode(true);
  }
}

export { UIComponent };
