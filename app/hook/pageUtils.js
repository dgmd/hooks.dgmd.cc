import {
  DGMD_BLOCK_TYPE_ID,
  DGMD_METADATA,
  DGMD_PROPERTIES,
  DGMD_VALUE
} from 'constants.dgmd.cc';
import {
  isNil
} from 'lodash-es';

export const getNotionDataPageMetadata = page => {
  return page[DGMD_METADATA];
};

//todo - return keys, or keys & values
export const getNotionDataPageProperties = page => {
  return page[DGMD_PROPERTIES];
};

export const getNotionDataPageId = page => {
  return getNotionDataPageMetadata(page)[DGMD_BLOCK_TYPE_ID][DGMD_VALUE];
}

//todo: getPropertyByPage & getPropertyByPageId & getPropertyKeysByPage & getPropertyKeysByPageId
export const getNotionDataPagePropertyValue = (page, propertyKey) => {
  if (isNil(page)) {
    return null;
  }
  if (!(DGMD_PROPERTIES in page)) {
    return null;
  }
  const properties = getNotionDataPageProperties(page);
  if (!(propertyKey in properties)) {
    return null;
  }
  const propertyObject = properties[propertyKey];
  if (!(DGMD_VALUE in propertyObject)) {
    return null;
  }
  return propertyObject[DGMD_VALUE];
};

export const mergePageLists = (existingList, incomingList) => {
  if (isNil(existingList)) {
    return incomingList;
  }
  if (isNil(incomingList)) {
    return existingList;
  }
  const getId = obj => getNotionDataPageMetadata(obj)[DGMD_BLOCK_TYPE_ID][DGMD_VALUE];

  const mergedList = [...existingList, ...incomingList.reduce((acc, obj) => {
    const existingIndex = existingList.findIndex(
      item => getId(item) === getId(obj) );
    if (existingIndex !== -1) {
      existingList[existingIndex] = obj; // Replace existing object
    }
    else {
      acc.push(obj); // Add new object
    }
    return acc;
  }, [])];

  return mergedList;
};