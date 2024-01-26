import {
  CRUD_PARAM_ACTION,
  CRUD_PARAM_CREATE_BLOCK_ID,
  CRUD_PARAM_CREATE_CHILDREN,
  CRUD_PARAM_CREATE_META,
  CRUD_PARAM_DELETE_BLOCK_ID,
  CRUD_PARAM_UPDATE_BLOCK,
  CRUD_PARAM_UPDATE_BLOCK_ID,
  CRUD_PARAM_UPDATE_META,
  CRUD_VALUE_ACTION_CREATE,
  CRUD_VALUE_ACTION_DELETE,
  CRUD_VALUE_ACTION_UPDATE,
  DGMD_BLOCK_TYPE_ID,
  DGMD_METADATA,
  DGMD_PROPERTIES,
  DGMD_TYPE,
  DGMD_VALUE,
  PROTO_RESPONSE_KEY_SNAPSHOT_TIMESTAMP,
  QUERY_RESPONSE_KEY_RESULT,
  QUERY_RESPONSE_KEY_SUCCESS
} from 'constants.dgmd.cc';
import {
  isArray,
  isNil,
  isObject
} from 'lodash-es';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  DGMD_DATA,
  DGMD_FILTERED_DATA,
  DGMD_LIVE_DATA,
  DGMD_VALID_DATA
} from './constants.js';
import {
  getNotionDataDb,
  getNotionDataPage,
  getNotionDataPages,
  isNotionDataLive,
  spliceNotionPage
} from './dataUtils.js';
import {
  mmMetaToNotionBlock,
  mmPropToNotionBlock,
  searchPages,
  sortPages
} from './pageUtils.js';
import {
  uniqueKey
} from './utils.js';

export const useNotionData = url => {

  const [urlObj, setUrlObj] = useState( x => null );
  const [urlUpdateObj, setUrlUpdateObj] = useState( x => null );

  const [notionData, setNotionData] = useState( x => null );
  const [filteredNotionData, setFilteredNotionData] = useState( x => {
    return {
      [DGMD_FILTERED_DATA]: true
    };
  } );

  const rUpdating = useRef( false );

  const [searchObj, setSearchObj] = useState( x => null );
  const rSearchObj = useRef( searchObj );
  const [sortObj, setSortObj] = useState( x => null );
  const rSortObj = useRef( sortObj );

  const handleCreate = useCallback ( (newPages) => {
    if (rUpdating.current) {
      return false;
    }
    const dbIds = Object.keys( newPages );
    if (dbIds.length === 0) {
      return false;
    }
    const dbId = dbIds[0];
    const db = getNotionDataDb( notionData, dbId );
    if (isNil(db)) {
      return false;
    }

    const pgPropData = newPages[DGMD_PROPERTIES];
    const pgPropDatas = isObject(pgPropData) ? pgPropData : {};
    const pgMetaData = newPages[DGMD_METADATA];
    const pgMetaDatas = isObject( pgMetaData ) ? pgMetaData : {};

    if (isNotionDataLive(notionData)) {
  
      const blockList = {};
      for (const [key, userBlock] of Object.entries(pgPropDatas)) {
        const nBlock = mmPropToNotionBlock( userBlock );
        if (!isNil(nBlock)) {
          blockList[key] = nBlock;
        }
      }
      const headerList = {};
      for (const [key, userBlock] of Object.entries(pgMetaDatas)) {
        const nBlock = mmMetaToNotionBlock( userBlock );
        if (!isNil(nBlock)) {
          headerList[key] = nBlock;
        }
      }

      const updateUrl = new URL( '/api/update', urlObj.origin );
      updateUrl.searchParams.append( CRUD_PARAM_ACTION, CRUD_VALUE_ACTION_CREATE );
      updateUrl.searchParams.append( CRUD_PARAM_CREATE_BLOCK_ID, dbId );
      updateUrl.searchParams.append( CRUD_PARAM_CREATE_CHILDREN, JSON.stringify(blockList) );
      updateUrl.searchParams.append( CRUD_PARAM_CREATE_META, JSON.stringify(headerList) );
      rUpdating.current = true;
      setUrlUpdateObj( x => updateUrl.href );
    }
    else {
      setNotionData( d => {
        const x = structuredClone( notionData );

        const uId = uniqueKey();
        pgMetaDatas[DGMD_BLOCK_TYPE_ID] = {
          [DGMD_TYPE]: DGMD_BLOCK_TYPE_ID,
          [DGMD_VALUE]: uId
        };
        const page = {
          [DGMD_PROPERTIES]: pgPropDatas,
          [DGMD_METADATA]: pgMetaDatas
        };
        const xPgs = getNotionDataPages( x, dbId );
        xPgs.unshift( page );
        return x;
      } );
    }
    return true;
  }, [
    notionData,
    urlObj
  ] );

  const handleUpdate = useCallback ( (update) => {
    if (rUpdating.current) {
      return false;
    }
    const dbIds = Object.keys( update );
    if (dbIds.length === 0) {
      return false;
    }
    const dbId = dbIds[0];
    const db = getNotionDataDb( notionData, dbId );
    if (isNil(db)) {
      return false;
    }
    const pgIds = Object.keys( update[dbId] );
    if (pgIds.length === 0) {
      return false;
    }
    const pgId = pgIds[0];
    const pgUpdate = update[dbId][pgId];
    const pgUpdateMeta = pgUpdate[DGMD_METADATA];
    const pgUpdateMetas = isObject( pgUpdateMeta ) ? pgUpdateMeta : {};
    const pgUpdateProp = pgUpdate[DGMD_PROPERTIES];
    const pgUpdateProps = isObject( pgUpdateProp ) ? pgUpdateProp : {};
    
    if (isNotionDataLive(notionData)) {

      const metaList = {};
      for (const [key, userBlock] of Object.entries(pgUpdateMetas)) {
        const mmBlock = mmMetaToNotionBlock( userBlock );
        if (!isNil(mmBlock)) {
          metaList[key] = mmBlock;
        }
      }
      const propList = {};
      for (const [key, userBlock] of Object.entries(pgUpdateProps)) {
        const mmBlock = mmPropToNotionBlock( userBlock );
        if (!isNil(mmBlock)) {
          propList[key] = mmBlock;
        }
      }

      const updateUrl = new URL( '/api/update', urlObj.origin );
      updateUrl.searchParams.append( CRUD_PARAM_ACTION, CRUD_VALUE_ACTION_UPDATE );
      updateUrl.searchParams.append( CRUD_PARAM_UPDATE_BLOCK_ID, pgId );
      updateUrl.searchParams.append( CRUD_PARAM_UPDATE_BLOCK, JSON.stringify(propList) );
      updateUrl.searchParams.append( CRUD_PARAM_UPDATE_META, JSON.stringify(metaList) );
      rUpdating.current = true;
      setUrlUpdateObj( x => updateUrl.href );
    }
    else {
      const updatePage = d => {
        const x = structuredClone( d );
        const xpg = getNotionDataPage( x, dbId, pgId );

        const xpgMetas = xpg[DGMD_METADATA];
        for (const [key, value] of Object.entries(pgUpdateMetas)) {
          xpgMetas[key] = value;
        }

        const xpgProps = xpg[DGMD_PROPERTIES];
        for (const [key, value] of Object.entries(pgUpdateProps)) {
          xpgProps[key] = value;
        }
        return x;
      };
      setNotionData( updatePage );
    }

    return true;
  }, [
    notionData,
    urlObj
  ] );

  const handleDelete = useCallback ( (dbId, pgId) => {
    if (rUpdating.current) {
      return false;
    }
    const pg = getNotionDataPage( notionData, dbId, pgId );
    if (isNil(pg)) {
      return false;
    }
    if (isNotionDataLive(notionData)) {
      const updateUrl = new URL( '/api/update', urlObj.origin );
      updateUrl.searchParams.append( CRUD_PARAM_ACTION, CRUD_VALUE_ACTION_DELETE );
      updateUrl.searchParams.append( CRUD_PARAM_DELETE_BLOCK_ID, pgId );
      rUpdating.current = true;
      setUrlUpdateObj( x => updateUrl.href );
    }
    else {
      setNotionData( x => spliceNotionPage( x, pgId ) );
    }
    return true;
  }, [
    notionData,
    urlObj
  ] );

  //load notion data
  useEffect( () => {

    async function fetchData() {
      rUpdating.current = true;
      try {
        const response = await fetch( url );
        const parsedJsonObject = await response.json( );

        const validStatus = parsedJsonObject[QUERY_RESPONSE_KEY_SUCCESS];
        if (isNil(validStatus) || !validStatus) {
          throw new Error( 'invalid data' );
        }

        //claim this data as our own
        delete parsedJsonObject[QUERY_RESPONSE_KEY_SUCCESS];
        parsedJsonObject[DGMD_FILTERED_DATA] = false;
        parsedJsonObject[DGMD_LIVE_DATA] = !isNil(parsedJsonObject[PROTO_RESPONSE_KEY_SNAPSHOT_TIMESTAMP]) || true;
        delete parsedJsonObject[PROTO_RESPONSE_KEY_SNAPSHOT_TIMESTAMP];
        parsedJsonObject[DGMD_DATA] = parsedJsonObject[QUERY_RESPONSE_KEY_RESULT];
        delete parsedJsonObject[QUERY_RESPONSE_KEY_RESULT];
        parsedJsonObject[DGMD_VALID_DATA] = true;

        rUpdating.current = false;
        setNotionData( x => parsedJsonObject );
        setFilteredNotionData( x => searchAndSortData(
          parsedJsonObject, rSearchObj.current, rSortObj.current
        ) );
      }
      catch( err ) {
        console.log( err );
        rUpdating.current = false;
        setNotionData( x => {
          return {
            [DGMD_VALID_DATA]: false,
          };
        } );
      }
    }

    if (url) {
      setUrlObj( x => new URL( url ) );
      fetchData( );
    }

  }, [
    url
  ] );

  //update search and sort
  useEffect( () => {
    if (rUpdating.current) {
      return;
    }
    setFilteredNotionData( x => searchAndSortData(
      notionData, searchObj, sortObj
    ) );
  }, [
    searchObj,
    sortObj,
    notionData
  ] );

  //update live crud response
  useEffect( () => {

    async function fetchData() {

      try {
        const crudResponse = await fetch( urlUpdateObj );
        const crudJson = await crudResponse.json( );

        
        // const params = new URLSearchParams( updateUrl );
        // if (params.has( URL_SEARCH_PARAM_PAGE_CURSOR_TYPE_REQUEST )) {
        //   const exsPrimaryPgs = getPrimaryPgs( newJsonObject );
        //   const newPrimaryPgs = getPrimaryPgs( crudJson );
        //   const merged = mergeLists( exsPrimaryPgs, newPrimaryPgs );
        //   newJsonObject[NOTION_RESULT][NOTION_RESULT_DGMD_PRIMARY_DATABASE][NOTION_RESULT_BLOCKS] = merged;

        //   const relDbs = crudJson[NOTION_RESULT][NOTION_RESULT_RELATION_DATABASES];
        //   for (const relDb of relDbs) {
        //     const relDbId = relDb[NOTION_RESULT_DATABASE_ID];
        //     const exDb = newJsonObject[NOTION_RESULT][NOTION_RESULT_RELATION_DATABASES].find( 
        //       db => db[NOTION_RESULT_DATABASE_ID] === relDbId );
        //     if (exDb) {
        //       const exRelPgs = exDb[NOTION_RESULT_BLOCKS];
        //       const newRelPgs = relDb[NOTION_RESULT_BLOCKS];
        //       const merged = mergeLists( exRelPgs, newRelPgs );
        //       exDb[NOTION_RESULT_BLOCKS] = merged;
        //     }
        //     else {
        //       newJsonObject[NOTION_RESULT][NOTION_RESULT_RELATION_DATABASES].push( relDb );
        //     }
        //   }

        //   const cursorData = 
        //     crudJson[NOTION_RESULT][NOTION_RESULT_DGMD_PRIMARY_DATABASE][NOTION_RESULT_CURSOR_DATA];
        //   newJsonObject[NOTION_RESULT][NOTION_RESULT_DGMD_PRIMARY_DATABASE][NOTION_RESULT_CURSOR_DATA] = cursorData;

        //   update(newJsonObject);
        // }

        if (crudJson['result']) {
          const result = crudJson['result'];
          if (result['delete']) {
              const delId = result['deleteId'];
              setNotionData( x => spliceNotionPage( x, delId ) );
          }
          if (result['create']) {
            const pg = result['page'];
            const dbId = result['dbId'];

            const updateNotionData = x => {
              const clone = structuredClone( x );
              const dbBlocks = getNotionDataPages( clone, dbId );
              dbBlocks.unshift( pg );
              return clone;
            };

            setNotionData( updateNotionData );
          }
          if (result['update']) {
            const pg = result['page'];
            const dbId = result['dbId'];
            const pgId = result['pgId'];

            const updateNotionData = x => {
              const clone = structuredClone( x );
              const dbBlocks = getNotionDataPages( clone, dbId );
              const idx = dbBlocks.findIndex( x => 
                x[DGMD_METADATA][DGMD_BLOCK_TYPE_ID][DGMD_VALUE] === pgId );
              if (idx >= 0) {
                dbBlocks.splice( idx, 1, pg );
              }
              return clone;
            };

            setNotionData( updateNotionData );
          }
        }

        rUpdating.current = false;
      }
      catch ( err ) {
        console.log( err );
        rUpdating.current = false;
      }

      setUrlUpdateObj( x => null );
    };

    if (!isNil(urlUpdateObj) && rUpdating.current) {
      fetchData();
    }

  }, [
    notionData,
    urlUpdateObj
  ] );

  const setSearch = useCallback( searchObj => {
    setSearchObj( x => searchObj );
    rSearchObj.current = searchObj;
  } );

  const setSort = useCallback( sortObj => {
    setSortObj( x => sortObj );
    rSortObj.current = sortObj;
  } );

  const hasSearch = useMemo( x => {
    return !isNil(searchObj);
  }, [
    searchObj
  ] );

  const hasSort = useMemo( x => {
    return !isNil(sortObj);
  }, [
    sortObj
  ] );

  return {
    setSearch,
    hasSearch,
    setSort,
    hasSort,
    handleCreate,
    handleUpdate,
    handleDelete,
    notionData,
    filteredNotionData,
    updating: rUpdating.current
  };
};

const searchAndSortData = ( jsonObject, search, sort ) => {
  const y = {
    [DGMD_VALID_DATA]: jsonObject[DGMD_VALID_DATA],
    [DGMD_FILTERED_DATA]: true,
    [DGMD_LIVE_DATA]: jsonObject[DGMD_LIVE_DATA],
    [DGMD_DATA]: structuredClone( jsonObject[DGMD_DATA] ),
  };

  //search
  const searchEntries = isNil(search) ? [] : Object.entries(search);
  const sortEntries = isNil(sort) ? [] : Object.entries(sort);
  for (const [searchDbId, searchObj] of searchEntries) {
    searchPages( y, searchDbId, searchObj );

    //sort
    for (const [sortDbId, sortRules] of sortEntries) {
      const spgs = getNotionDataPages( y, sortDbId );
      const fields = isArray(sortRules.fields) ? sortRules.fields : [];
      const directions = isArray(sortRules.directions) ? sortRules.directions : [];
      sortPages( spgs, fields, directions );
    }
  }

  Object.freeze( y );
  return y;
};