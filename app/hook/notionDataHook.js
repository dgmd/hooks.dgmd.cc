import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import {
  isEmpty,
  isNil,
  remove,
  set,
  update
} from 'lodash-es';

import {
  getNotionDataPage,
  spliceNotionPage,
  isNotionDataLive,
  getNotionDataPages,
  getNotionDataDb
} from './dataUtils.js';

import {
  URL_SEARCH_PARAM_ACTION,
  URL_SEARCH_VALUE_ACTION_DELETE,
  URL_SEARCH_PARAM_DELETE_BLOCK_ID,
  URL_SEARCH_VALUE_ACTION_CREATE,
  URL_SEARCH_PARAM_CREATE_BLOCK_ID,
  URL_SEARCH_PARAM_CREATE_CHILDREN,
  URL_SEARCH_PARAM_CREATE_META,
  DGMDCC_BLOCK_TYPE,
  DGMDCC_BLOCK_VALUE,
  DGMDCC_BLOCK_ID,
  DGMDCC_BLOCK_METADATA,
  DGMDCC_BLOCK_PROPERTIES
} from './constants.js';

import {
  sortPages,
  searchPages
} from './pageUtils.js';

import {
  uniqueKey
} from './utils.js';

export const useNotionData = url => {

  const [urlObj, setUrlObj] = useState( x => null );
  const [urlUpdateObj, setUrlUpdateObj] = useState( x => null );

  const [notionData, setNotionData] = useState( x => null );
  const [filteredNotionData, setFilteredNotionData] = useState( x => null );

  const updating = useRef( false );

  const [searchObj, setSearchObj] = useState( x => null );
  const rSearch = useRef( searchObj );
  const [sortObj, setSortObj] = useState( x => null );
  const rSort = useRef( sortObj );

  const handleCreate = useCallback ( (page) => {
    if (updating.current) {
      return false;
    }
    const dbIds = Object.keys( page );
    if (dbIds.length === 0) {
      return false;
    }
    const dbId = dbIds[0];
    const db = getNotionDataDb( notionData, dbId );
    if (isNil(db)) {
      return false;
    }
    const pgPropData = isNil( page[DGMDCC_BLOCK_PROPERTIES] ) ? {} : page[DGMDCC_BLOCK_PROPERTIES];
    const pgMetaData = isNil( page[DGMDCC_BLOCK_METADATA] ) ? {} : page[DGMDCC_BLOCK_METADATA];

    if (isNotionDataLive(notionData)) {
      const blockList = {};
      for (const [key, userBlock] of Object.entries(pgPropData)) {
        const nBlock = mmBlocktoNotionBlock( userBlock );
        if (!isNil(nBlock)) {
          blockList[key] = nBlock;
        }
      }
      const headerList = {};
      for (const [key, userBlock] of Object.entries(pgMetaData)) {
        const nBlock = mmBlocktoHeaderBlock( userBlock );
        if (!isNil(nBlock)) {
          headerList[key] = nBlock;
        }
      }

      const updateUrl = new URL( '/api/update', urlObj.origin );
      updateUrl.searchParams.append( URL_SEARCH_PARAM_ACTION, URL_SEARCH_VALUE_ACTION_CREATE );
      updateUrl.searchParams.append( URL_SEARCH_PARAM_CREATE_BLOCK_ID, dbId );
      updateUrl.searchParams.append( URL_SEARCH_PARAM_CREATE_CHILDREN, JSON.stringify(blockList) );
      updateUrl.searchParams.append( URL_SEARCH_PARAM_CREATE_META, JSON.stringify(headerList) );
      updating.current = true;
      setUrlUpdateObj( x => updateUrl.href );
    }
    else {
      const uId = uniqueKey();
      pgMetaData[DGMDCC_BLOCK_ID] = {
        [DGMDCC_BLOCK_TYPE]: DGMDCC_BLOCK_ID,
        [DGMDCC_BLOCK_VALUE]: uId
      };
      const page = {
        [DGMDCC_BLOCK_PROPERTIES]: pgPropData,
        [DGMDCC_BLOCK_METADATA]: pgMetaData
      };
      const cloneNotionData = structuredClone( notionData );
      const dbBlocks = getNotionDataPages( cloneNotionData, dbId );
      dbBlocks.unshift( page );
      setNotionData( x => cloneNotionData );
      setFilteredNotionData( x => searchAndSortData( cloneNotionData ) );
    }
    
  }, [
    notionData
  ] );

  const handleUpdate = useCallback ( (update) => {
    if (updating.current) {
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
    const pg = getNotionDataPage( notionData, dbId, pgId );
    const pgUpdate = update[dbId][pgId];
    console.log( 'pg', pg, 'pgUpdate', pgUpdate );

  }, [
    notionData
  ] );

  const handleDelete = useCallback ( (dbId, pgId) => {
    if (updating.current) {
      return false;
    }
    const pg = getNotionDataPage( notionData, dbId, pgId );
    if (isNil(pg)) {
      return false;
    }
    if (isNotionDataLive(notionData)) {
      const updateUrl = new URL( '/api/update', urlObj.origin );
      updateUrl.searchParams.append( URL_SEARCH_PARAM_ACTION, URL_SEARCH_VALUE_ACTION_DELETE );
      updateUrl.searchParams.append( URL_SEARCH_PARAM_DELETE_BLOCK_ID, pgId );
      updating.current = true;
      setUrlUpdateObj( x => updateUrl.href );
    }
    else {
      setNotionData( x => spliceNotionPage( x, pgId ) );
      setFilteredNotionData( x => spliceNotionPage( x, pgId ) );
    }
    return true;
  }, [
    notionData,
    urlObj
  ] );


  useEffect( () => {

    async function fetchData() {
      updating.current = true;
      try {
        const response = await fetch( url );
        const parsedJsonObject = await response.json( );

        updating.current = false;
        setNotionData( x => parsedJsonObject );
        setFilteredNotionData( x => parsedJsonObject );
      }
      catch( err ) {
        console.log( err );
        updating.current = false;
        setNotionData( x => {
          return {};
        } );
        setFilteredNotionData( x => {
          return {};
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

  //update search/sort data here
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
        //   newJsonObject[NOTION_RESULT][NOTION_RESULT_PRIMARY_DATABASE][NOTION_RESULT_BLOCKS] = merged;

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
        //     crudJson[NOTION_RESULT][NOTION_RESULT_PRIMARY_DATABASE][NOTION_RESULT_CURSOR_DATA];
        //   newJsonObject[NOTION_RESULT][NOTION_RESULT_PRIMARY_DATABASE][NOTION_RESULT_CURSOR_DATA] = cursorData;

        //   update(newJsonObject);
        // }

        if (crudJson['result']) {
          const result = crudJson['result'];
          if (result['delete']) {
              const delId = result['deleteId'];
              setNotionData( x => spliceNotionPage( x, delId ) );
              setFilteredNotionData( x => spliceNotionPage( x, delId ) );
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
            setFilteredNotionData( x => {
              const y = updateNotionData( x );
              return searchAndSortData( y, rSearch.current, rSort.current );
            } );
          }
          if (result['update']) {
            const pg = result['page'];
            const dbId = result['dbId'];
            const pgId = result['pgId'];

            const updateNotionData = x => {
              const clone = structuredClone( x );
              const dbBlocks = getNotionDataPages( clone, dbId );
              const idx = dbBlocks.findIndex( x => 
                x[DGMDCC_BLOCK_METADATA][DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE] === pgId );
              if (idx >= 0) {
                dbBlocks.splice( idx, 1, pg );
              }
              return clone;
            };

            setNotionData( updateNotionData );

            setFilteredNotionData( x => {
              const y = updateNotionData( x );
              return searchAndSortData( y, rSearch.current, rSort.current );
            } );
          }
        }

        updating.current = false;
      }

      catch ( err ) {
        console.log( err );
        updating.current = false;
      }

      setUrlUpdateObj( x => null );
    };

    if (!isNil(urlUpdateObj) && updating.current) {
      fetchData();
    }

  }, [
    notionData,
    urlUpdateObj
  ] );

  useEffect( () => {
    if (updating.current) {
      return;
    }
    setFilteredNotionData( x => searchAndSortData(
      notionData, searchObj, sortObj
    ) );
  }, [
    searchObj,
    sortObj
  ] );

  const setSearch = useCallback( searchObj => {
    setSearchObj( x => searchObj );
    rSearch.current = searchObj;
  } );

  const setSort = useCallback( sortObj => {
    setSortObj( x => sortObj );
    rSort.current = sortObj;
  } );

  return {
    setSearch,
    setSort,
    handleCreate,
    handleUpdate,
    handleDelete,
    notionData,
    filteredNotionData,
    updating
  };
};

const searchAndSortData = ( jsonObject, search, sort ) => {
  const x = structuredClone( jsonObject );

  //search
  const searchEntries = isNil(search) ? [] : Object.entries(search);
  for (const [dbId, searchObj] of searchEntries) {
    const db = getNotionDataDb( x, dbId );
    if (db) {
      const pgs = getNotionDataPages( x, dbId );
      searchPages( pgs, searchObj );
    }
  }

  //sort
  const sortEntries = isNil(sort) ? [] : Object.entries(sort);
  for (const [dbId, sortRules] of sortEntries) {
    const db = getNotionDataDb( x, dbId );
    if (db) {
      const pgs = getNotionDataPages( x, dbId );
      const fields = sortRules.fields;
      const directions = sortRules.directions;
      sortPages( pgs, fields, directions );
    }
  }

  Object.freeze( x );

  return x;
};

