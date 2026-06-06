import BoardPresenter from './presenter/board.js';
import FilterPresenter from './presenter/filter.js';
import PointsModel from './model/points-model.js';
import OffersModel from './model/offers-model.js';
import DestinationsModel from './model/destinations-model.js';
import FilterModel from './model/filter-model.js';
import PointsApiService from './api/points-api-service.js';
import {END_POINT} from './const.js';

const AUTHORIZATION = `Basic ${Math.random().toString(36).slice(2)}`;

const tripMainElement = document.querySelector('.trip-main');
const filterContainerElement = document.querySelector('.trip-controls__filters');
const tripEventsElement = document.querySelector('.trip-events');
const newPointButtonElement = document.querySelector('.trip-main__event-add-btn');

const pointsApiService = new PointsApiService(END_POINT, AUTHORIZATION);

const pointsModel = new PointsModel({pointsApiService});
const offersModel = new OffersModel({pointsApiService});
const destinationsModel = new DestinationsModel({pointsApiService});
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

Promise.allSettled([
  offersModel.init(),
  destinationsModel.init(),
]).then((results) => {
  const hasDependencyError = results.some((result) => result.status === 'rejected');
  pointsModel.init(hasDependencyError);
});
