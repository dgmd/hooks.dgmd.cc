
import {
  isNil,
} from 'lodash-es';

import {
  BLOCK_TYPE_RELATION,
  DGMDCC_BLOCK_ID,
  DGMDCC_BLOCK_METADATA,
  DGMDCC_BLOCK_PROPERTIES,
  DGMDCC_BLOCK_TYPE,
  DGMDCC_BLOCK_VALUE,
  NOTION_RESULT,
  NOTION_RESULT_BLOCKS,
  NOTION_RESULT_CURSOR_DATA,
  NOTION_RESULT_DATABASE_ID,
  NOTION_RESULT_PRIMARY_DATABASE,
  NOTION_RESULT_RELATION_DATABASES,
  NOTION_RESULT_SUCCESS,
  SNAPSHOT_TIMESTAMP
} from './constants.js';

// # # #
export const isNotionDataLoaded = (jsonObject) => {
  return !isNil( jsonObject );
};

export const isNotionDataLive = (jsonObject) => {
  return isNil( jsonObject[SNAPSHOT_TIMESTAMP] );
};
  
export const isNotionDataValid = (jsonObject) => {
  if (!isNotionDataLoaded(jsonObject)) {
    return false;
  }
  const liveData = isNotionDataLive(jsonObject);
  return !( 
    isNil( getNotionDataPrimaryDbId(jsonObject, liveData) ) && 
    isNil( getNotionDataRelationDbIds(jsonObject, liveData) )
  );
};
  
export const getNotionDataPrimaryDbId = (jsonObject) => {
  if (isNil(jsonObject)) {
    return null;
  }
  try {
    const liveData = isNotionDataLive(jsonObject);
    const job = liveData ? jsonObject[NOTION_RESULT] : jsonObject;
    return job[NOTION_RESULT_PRIMARY_DATABASE][NOTION_RESULT_DATABASE_ID];
  }
  catch( err ) {
    console.log( err );
    return null;
  }
};
  
const getNotionDataRelationDbIds = (jsonObject) => {
  if (!isNil(jsonObject)) {
    try {
      const liveData = isNotionDataLive(jsonObject);
      const job = liveData ? jsonObject[NOTION_RESULT] : jsonObject;
      return job[NOTION_RESULT_RELATION_DATABASES].map( db => db[NOTION_RESULT_DATABASE_ID] );
    }
    catch( err ) {
      console.log( err );
    }
  }
  return [];
};
  
export const getNotionDataDb = (jsonObject, dbId) => {
  if (isNil(jsonObject)) {
    return null;
  }
  const liveData = isNotionDataLive(jsonObject);
  if (liveData && jsonObject[NOTION_RESULT_SUCCESS] === false) {
    return null;
  }

  const job = liveData ? jsonObject[NOTION_RESULT] : jsonObject;

  const primary = job[NOTION_RESULT_PRIMARY_DATABASE];
  if (primary[NOTION_RESULT_DATABASE_ID] === dbId) {
    return primary;
  }
  for (var i=0; i<job[NOTION_RESULT_RELATION_DATABASES].length; i++) {
    const db = job[NOTION_RESULT_RELATION_DATABASES][i];
    if (db[NOTION_RESULT_DATABASE_ID] === dbId) {
      return db;
    }
  }
  return null;
};
  
export const getNextCursorData = (jsonObject) => {
  const primaryDbId = getNotionDataPrimaryDbId( jsonObject );
  const db = getNotionDataDb( jsonObject, primaryDbId );
  if (isNil(db)) {
    return null;
  }
  const cursorData = db[NOTION_RESULT_CURSOR_DATA];
  return cursorData;
};

export const hasNotionDataNextCursorData = (jsonObject) => {
  return !isNil( getNotionDataNextCursorData(jsonObject) );
};
  
export const getDbIdByName = (jsonObject, name) => {
  if (isNil(jsonObject)) {
    return null;
  }
  try {
    const primary = jsonObject[NOTION_RESULT_PRIMARY_DATABASE];
    if (primary[NOTION_RESULT_DATABASE_TITLE] === name) {
      return primary[NOTION_RESULT_DATABASE_ID];
    }
    const rels = jsonObject[NOTION_RESULT_RELATION_DATABASES];
    for (var i=0; i<rels.length; i++) {
      const db = rels[i];
      if (db[NOTION_RESULT_DATABASE_TITLE] === name) {
        return db[NOTION_RESULT_DATABASE_ID];
      }
    }
    return null;
  }
  catch( err ) {
    return null;
  }
};

export const getNotionDataPage = (jsonObject, dbId, pageId) => {
  const dbIds = isNil(dbId) ? getNotionDataAllDbIds( jsonObject ) : [dbId];
  for (const xdbId of dbIds) {
    const dbBlocks = getNotionDataPages( jsonObject, xdbId );
    const pageIdx = dbBlocks.findIndex( block => {
      const blockIdMeta = block[DGMDCC_BLOCK_METADATA];
      const blockIdObj = blockIdMeta[DGMDCC_BLOCK_ID];
      const blockId = blockIdObj[DGMDCC_BLOCK_VALUE];
      return blockId === pageId;
    } );
    if (pageIdx >= 0) {
      return dbBlocks[pageIdx];
    }
  };
  return null;
};

export const getNotionDataPages = (jsonObject, dbId) => {
  if (isNil(jsonObject) || !isNotionDataValid(jsonObject)) {
    return [];
  }

  try {
    const db = getNotionDataDb( jsonObject, dbId );
    const dbBlocks = db[NOTION_RESULT_BLOCKS];
    return dbBlocks;
  }
  catch( err ) {
    console.log( err );
    return [];
  }
};

// const getNotionDataPageIdx = (dbBlocks, pageId) => {
//   const pageIdx = dbBlocks.findIndex( block => {
//     const blockIdMeta = block[DGMDCC_BLOCK_METADATA];
//     const blockIdObj = blockIdMeta[DGMDCC_BLOCK_ID];
//     const blockId = blockIdObj[DGMDCC_BLOCK_VALUE];
//     return blockId === pageId;
//   } );
//   return pageIdx;
// };

export const getNotionDataAllDbIds = (notionData) => {
  return [ 
    getNotionDataPrimaryDbId(notionData, true), 
    ...getNotionDataRelationDbIds(notionData, true)
  ];
};


export const spliceNotionPage = (notionData, pgId) => {
  const x = structuredClone( notionData );

  const allDbIds = getNotionDataAllDbIds( x );

  for (const dbId of allDbIds) {
    const db = getNotionDataDb( x, dbId, true );
    const dbPgs = db[NOTION_RESULT_BLOCKS];
    const idx = dbPgs.findIndex( x => 
      x[DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE] === pgId );
    if (idx >= 0) {
      dbPgs.splice( idx, 1 );
    }
    for (const pg of dbPgs) {
      const pgProps = pg[DGMDCC_BLOCK_PROPERTIES];
      for (const [key, value] of Object.entries(pgProps)) {
        if (value[DGMDCC_BLOCK_TYPE] === BLOCK_TYPE_RELATION) {
          const relValue = value[DGMDCC_BLOCK_VALUE];
          const relIdx = relValue.findIndex( x => 
            x['PAGE_ID'] === pgId );
          if (relIdx >= 0) {
            relValue.splice( relIdx, 1 );
          }
        }
      }
    }
  }
  return x;
}