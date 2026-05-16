import BoardPresenter from './presenter/board.js';
import FilterPresenter from './presenter/filter.js';
import PointsModel from './model/points-model.js';
import OffersModel from './model/offers-model.js';
import DestinationsModel from './model/destinations-model.js';
import FilterModel from './model/filter-model.js';

const tripMainElement = document.querySelector('.trip-main');
const filterContainerElement = document.querySelector('.trip-controls__filters');
const tripEventsElement = document.querySelector('.trip-events');
const newPointButtonElement = document.querySelector('.trip-main__event-add-btn');

const pointsModel = new PointsModel();
const offersModel = new OffersModel();
const destinationsModel = new DestinationsModel();
const filterModel = new FilterModel();

const boardPresenter = new BoardPresenter({
  tripMainContainer: tripMainElement,
  tripEventsContainer: tripEventsElement,
  pointsModel,
  offersModel,
  destinationsModel,
  filterModel,
  newPointButton: newPointButtonElement,
});

const filterPresenter = new FilterPresenter({
  filterContainer: filterContainerElement,
  filterModel,
  pointsModel,
});

filterPresenter.init();
boardPresenter.init();
