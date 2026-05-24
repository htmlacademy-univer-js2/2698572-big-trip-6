import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import {FilterType} from './const.js';

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

export {filter};
