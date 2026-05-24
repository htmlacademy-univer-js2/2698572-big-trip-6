import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import {FilterType, SortType} from './const.js';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

function isPointFuture(point) {
  return dayjs(point.dateFrom).isAfter(dayjs());
}

function isPointPresent(point) {
  return dayjs(point.dateFrom).isSameOrBefore(dayjs()) && dayjs(point.dateTo).isSameOrAfter(dayjs());
}

function isPointPast(point) {
  return dayjs(point.dateTo).isBefore(dayjs());
}

const filter = {
  [FilterType.EVERYTHING]: (points) => points,
  [FilterType.FUTURE]: (points) => points.filter(isPointFuture),
  [FilterType.PRESENT]: (points) => points.filter(isPointPresent),
  [FilterType.PAST]: (points) => points.filter(isPointPast),
};

function updateItem(items, update) {
  return items.map((item) => item.id === update.id ? update : item);
}

function getPointDuration(point) {
  return dayjs(point.dateTo).diff(dayjs(point.dateFrom));
}

function sortByDay(a, b) {
  return dayjs(a.dateFrom).diff(dayjs(b.dateFrom));
}

function sortByTime(a, b) {
  return getPointDuration(b) - getPointDuration(a);
}

function sortByPrice(a, b) {
  return b.basePrice - a.basePrice;
}

const sort = {
  [SortType.DAY]: (points) => [...points].sort(sortByDay),
  [SortType.TIME]: (points) => [...points].sort(sortByTime),
  [SortType.PRICE]: (points) => [...points].sort(sortByPrice),
};

export {filter, updateItem, sort};
