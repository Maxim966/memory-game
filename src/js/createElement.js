export function createElement(
  tagName,
  { className, attributes = {}, on = {}, children = [], text } = {},
) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  for (const [name, value] of Object.entries(attributes)) {
    if (value === null || value === undefined || value === false) {
      continue;
    }

    element.setAttribute(name, value === true ? '' : String(value));
  }

  for (const [eventName, handler] of Object.entries(on)) {
    element.addEventListener(eventName, handler);
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  const normalizedChildren = Array.isArray(children) ? children : [children];

  for (const child of normalizedChildren) {
    if (child === null || child === undefined || child === false) {
      continue;
    }

    element.append(
      child instanceof Node ? child : document.createTextNode(String(child)),
    );
  }

  return element;
}
