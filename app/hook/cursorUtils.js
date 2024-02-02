import {
  DGMD_CURSOR_DATA,
  DGMD_CURSOR_NEXT
} from 'constants.dgmd.cc';
import {
  isEmpty,
  isNil
} from 'lodash-es';

import {
  getNotionDataDb,
  getNotionDataPrimaryDbId
} from './dataUtils.js';

const getNotionDataNextCursorObject = (jsonObject) => {
  const primaryDbId = getNotionDataPrimaryDbId( jsonObject );
  const db = getNotionDataDb( jsonObject, primaryDbId );
  if (isNil(db)) {
    return null;
  }
  const cursorData = db[DGMD_CURSOR_DATA];
  return cursorData;
};

export const hasNotionDataNextCursor = (jsonObject) => {
  const nextCursorData = getNotionDataNextCursorObject(jsonObject);
  if (!isNil(nextCursorData)) {
    return nextCursorData[DGMD_CURSOR_NEXT];
  }
  return false;
};

export const getNotionDataNextCursor = (jsonObject) => {
  if (hasNotionDataNextCursor(jsonObject)) {
    const obj = getNotionDataNextCursorObject(jsonObject);
    if (!isNil(obj)) {
      return obj[DGMD_CURSOR_NEXT];
    }
  }
  return null;
};
    