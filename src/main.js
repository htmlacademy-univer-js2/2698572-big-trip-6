import BoardPresenter from './presenter/board.js';

const tripMainElement = document.querySelector('.trip-main');
const filterContainerElement = document.querySelector('.trip-controls__filters');
const tripEventsElement = document.querySelector('.trip-events');

const boardPresenter = new BoardPresenter({
  tripMainContainer: tripMainElement,
  filterContainer: filterContainerElement,
  tripEventsContainer: tripEventsElement,
});

boardPresenter.init();
