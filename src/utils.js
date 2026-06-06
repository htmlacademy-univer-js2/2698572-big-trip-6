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

function sortByDate(a, b) {
  return dayjs(a.dateFrom).diff(dayjs(b.dateFrom));
}

function getPointDuration(point) {
  return dayjs(point.dateTo).diff(dayjs(point.dateFrom));
}

function sortByTime(a, b) {
  return getPointDuration(b) - getPointDuration(a);
}

function sortByPrice(a, b) {
  return b.basePrice - a.basePrice;
}

const sort = {
  [SortType.DAY]: (points) => [...points].sort(sortByDate),
  [SortType.TIME]: (points) => [...points].sort(sortByTime),
  [SortType.PRICE]: (points) => [...points].sort(sortByPrice),
};

function getTripRoute(points, destinations) {
  if (points.length === 0) {
    return '';
  }

  const sorted = [...points].sort(sortByDate);
  const cities = sorted
    .map((point) => destinations.find((d) => d.id === point.destination)?.name)
    .filter(Boolean);

  if (cities.length === 0) {
    return '';
  }

  if (cities.length <= 3) {
    return cities.join(' &mdash; ');
  }

  return `${cities[0]} &mdash;...&mdash; ${cities[cities.length - 1]}`;
}

function getTripDates(points) {
  if (points.length === 0) {
    return '';
  }

  const sorted = [...points].sort(sortByDate);
  const start = dayjs(sorted[0].dateFrom);
  const end = dayjs(sorted[sorted.length - 1].dateTo);

  if (start.isSame(end, 'month')) {
    return `${start.format('DD')}&nbsp;&mdash;&nbsp;${end.format('DD MMM')}`;
  }

  return `${start.format('DD MMM')}&nbsp;&mdash;&nbsp;${end.format('DD MMM')}`;
}

function getTripCost(points, offers) {
  return points.reduce((total, point) => {
    const typeOffers = offers.find((o) => o.type === point.type)?.offers ?? [];
    const offersCost = typeOffers
      .filter((offer) => point.offers.includes(offer.id))
      .reduce((sum, offer) => sum + offer.price, 0);
    return total + point.basePrice + offersCost;
  }, 0);
}

export {filter, sort, getTripRoute, getTripDates, getTripCost};
