const EVENT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
};

const DEFAULT_POINT = {
  type: 'flight',
  destination: '',
  dateFrom: new Date().toISOString(),
  dateTo: new Date().toISOString(),
  basePrice: 0,
  offers: [],
  isFavorite: false,
};

export {EVENT_TYPES, FilterType, UserAction, UpdateType, DEFAULT_POINT};
