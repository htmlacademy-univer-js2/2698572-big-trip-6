import AbstractView from '../framework/view/abstract-view.js';

const LOAD_ERROR_MESSAGE = 'Failed to load latest route information';

function createLoadErrorTemplate() {
  return `<p class="trip-events__msg">${LOAD_ERROR_MESSAGE}</p>`;
}

export default class LoadErrorView extends AbstractView {
  get template() {
    return createLoadErrorTemplate();
  }
}
