import {
  DGMD_CURSOR_DATA,
  DGMD_CURSOR_HAS_MORE
} from 'constants.dgmd.cc';
import {
  isNil
} from 'lodash-es';

import {
  getNotionDataDb,
  getNotionDataPrimaryDbId
} from './dataUtils.js';

export const getNotionDataNextCursor = (jsonObject) => {
  const primaryDbId = getNotionDataPrimaryDbId( jsonObject );
  const db = getNotionDataDb( jsonObject, primaryDbId );
  if (isNil(db)) {
    return null;
  }
  const cursorData = db[DGMD_CURSOR_DATA];
  return cursorData;
};

export const hasNotionDataNextCursor = (jsonObject) => {
  const nextCursorData = getNotionDataNextCursor(jsonObject);
  if (!isNil( nextCursorData )) {
    return DGMD_CURSOR_HAS_MORE in nextCursorData && nextCursorData[DGMD_CURSOR_HAS_MORE];
  }
  return false;
};
    