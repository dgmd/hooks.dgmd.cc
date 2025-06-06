import {
  DGMD_CURSOR_DATA,
  DGMD_CURSOR_HAS_MORE,
  DGMD_CURSOR_NEXT
} from 'constants.dgmd.cc';
import {
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
  return db[DGMD_CURSOR_DATA];
};

export const hasNotionDataNextCursor = (jsonObject) => {
  const nextCursorData = getNotionDataNextCursorObject(jsonObject);
  if (isNil(nextCursorData)) {
    return false;
  }
  if (!(DGMD_CURSOR_HAS_MORE in nextCursorData)) {
    return false;
  }
  if (!nextCursorData[DGMD_CURSOR_HAS_MORE]) {
    return false;
  }
  if (isNil(nextCursorData[DGMD_CURSOR_NEXT])) {
    return false;
  }
  return true;
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
    