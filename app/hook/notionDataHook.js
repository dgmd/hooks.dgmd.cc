import {
  CRUD_PARAM_ACTION,
  CRUD_PARAM_CREATE_BLOCK_ID,
  CRUD_PARAM_CREATE_CHILDREN,
  CRUD_PARAM_CREATE_META,
  CRUD_PARAM_DELETE_BLOCK_ID,
  CRUD_PARAM_UPDATE_BLOCK,
  CRUD_PARAM_UPDATE_BLOCK_ID,
  CRUD_PARAM_UPDATE_META,
  CRUD_RESPONSE_CREATE,
  CRUD_RESPONSE_DB_ID,
  CRUD_RESPONSE_DELETE,
  CRUD_RESPONSE_DELETE_ID,
  CRUD_RESPONSE_PAGE,
  CRUD_RESPONSE_RESULT,
  CRUD_RESPONSE_RESULT_TYPE,
  CRUD_RESPONSE_UPDATE,
  CRUD_RESPONSE_UPDATE_ID,
  CRUD_VALUE_ACTION_CREATE,
  CRUD_VALUE_ACTION_DELETE,
  CRUD_VALUE_ACTION_UPDATE,
  DGMD_BLOCKS,
  DGMD_BLOCK_TYPE_ID,
  DGMD_DATABASE_ID,
  DGMD_METADATA,
  DGMD_PAGE_ID,
  DGMD_PRIMARY_DATABASE,
  DGMD_PROPERTIES,
  DGMD_RELATION_DATABASES,
  DGMD_TYPE,
  DGMD_VALUE,
  PROTO_RESPONSE_KEY_SNAPSHOT_TIMESTAMP,
  QUERY_PARAM_PAGE_CURSOR_ID_REQUEST,
  QUERY_PARAM_PAGE_CURSOR_TYPE_REQUEST,
  QUERY_RESPONSE_KEY_RESULT,
  QUERY_RESPONSE_KEY_SUCCESS,
  QUERY_VALUE_PAGE_CURSOR_TYPE_SPECIFIC
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
  IDGMD_DATA,
  IDGMD_FILTERED_DATA,
  IDGMD_LIVE_DATA,
  IDGMD_PRIMARY_DBID,
  IDGMD_RELATION_DBIDS,
  IDGMD_VALID_DATA
} from './constants.js';
import {
  getNotionDataNextCursor
} from './cursorUtils.js';
import {
  getNotionDataDb,
  getNotionDataPage,
  getNotionDataPages,
  getNotionDataPrimaryDbId,
  getNotionDataRelationDbIds,
  isNotionDataLive,
  spliceNotionPage
} from './dataUtils.js';
import {
  mergePageLists,
  searchPages,
  sortPages
} from './pageUtils.js';
import {
  uniqueKey
} from './utils.js';

export const useNotionData = url => {

  const [urlObj, setUrlObj] = useState( x => null );
  const [urlUpdateObj, setUrlUpdateObj] = useState( x => null );
  const [urlCursorObj, setUrlCursorObj] = useState( x => null );

  const [notionData, setNotionData] = useState( x => null );
  const [filteredNotionData, setFilteredNotionData] = useState( x => {
    return {
      [IDGMD_FILTERED_DATA]: true
    };
  } );

  const rUpdating = useRef( false );

  const [searchObj, setSearchObj] = useState( x => null );
  const rSearchObj = useRef( searchObj );
  const [sortObj, setSortObj] = useState( x => null );
  const rSortObj = useRef( sortObj );

  const handleCreate = useCallback ( (update) => {
    if (rUpdating.current) {
      return false;
    }
    if (!(DGMD_DATABASE_ID in update)) {
      return false;
    }
    const dbId = update[DGMD_DATABASE_ID];
    const db = getNotionDataDb( notionData, dbId );
    if (isNil(db)) {
      return false;
    }
    const pgUpdateMeta = update[DGMD_METADATA];
    const pgUpdateMetas = isObject( pgUpdateMeta ) ? pgUpdateMeta : {};
    const pgUpdateProp = update[DGMD_PROPERTIES];
    const pgUpdateProps = isObject( pgUpdateProp ) ? pgUpdateProp : {};
    if (isNotionDataLive(notionData)) {
      const updateUrl = new URL( '/api/update', urlObj.origin );
      updateUrl.searchParams.append( CRUD_PARAM_ACTION, CRUD_VALUE_ACTION_CREATE );
      updateUrl.searchParams.append( CRUD_PARAM_CREATE_BLOCK_ID, dbId );
      updateUrl.searchParams.append( CRUD_PARAM_CREATE_META, JSON.stringify(pgUpdateMetas) );
      updateUrl.searchParams.append( CRUD_PARAM_CREATE_CHILDREN, JSON.stringify(pgUpdateProps) );
      rUpdating.current = true;
      setUrlUpdateObj( x => updateUrl.href );
    }
    else {
      //todo: a basic prune of the props and metas
      setNotionData( d => {
        const x = structuredClone( notionData );

        const uId = uniqueKey();
        pgUpdateMetas[DGMD_BLOCK_TYPE_ID] = {
          [DGMD_TYPE]: DGMD_BLOCK_TYPE_ID,
          [DGMD_VALUE]: uId
        };
        const page = {
          [DGMD_PROPERTIES]: pgUpdateProps,
          [DGMD_METADATA]: pgUpdateMetas
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
    if (!(DGMD_DATABASE_ID in update)) {
      return false;
    }
    const dbId = update[DGMD_DATABASE_ID];
    const db = getNotionDataDb( notionData, dbId );
    if (isNil(db)) {
      return false;
    }
    if (!(DGMD_PAGE_ID in update)) {
      return false;
    }

    const pgId = update[DGMD_PAGE_ID];
    const pgUpdateMeta = update[DGMD_METADATA];
    const pgUpdateMetas = isObject( pgUpdateMeta ) ? pgUpdateMeta : {};
    const pgUpdateProp = update[DGMD_PROPERTIES];
    const pgUpdateProps = isObject( pgUpdateProp ) ? pgUpdateProp : {};
    
    if (isNotionDataLive(notionData)) {
      const updateUrl = new URL( '/api/update', urlObj.origin );
      updateUrl.searchParams.append( CRUD_PARAM_ACTION, CRUD_VALUE_ACTION_UPDATE );
      updateUrl.searchParams.append( CRUD_PARAM_UPDATE_BLOCK_ID, pgId );
      updateUrl.searchParams.append( CRUD_PARAM_UPDATE_BLOCK, JSON.stringify(pgUpdateProps) );
      updateUrl.searchParams.append( CRUD_PARAM_UPDATE_META, JSON.stringify(pgUpdateMetas) );
      rUpdating.current = true;
      setUrlUpdateObj( x => updateUrl.href );
    }
    else {
      const updatePage = d => {
        const x = structuredClone( d );
        const xpg = getNotionDataPage( x, dbId, pgId );

        const xpgMetas = xpg[DGMD_METADATA];
        for (const [key, value] of Object.entries(pgUpdateMetas)) {
          if (key in xpgMetas) {
            xpgMetas[key] = value;
          }
        }

        const xpgProps = xpg[DGMD_PROPERTIES];
        for (const [key, value] of Object.entries(pgUpdateProps)) {
          if (key in xpgProps) {
            xpgProps[key] = value;
          }
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

  const handleNextCursor = useCallback ( () => {
    const nextCursor = getNotionDataNextCursor( notionData );
    if (isNil(nextCursor)) {
      return false;
    }
    const params = new URLSearchParams(urlObj.search);
    params.set( QUERY_PARAM_PAGE_CURSOR_TYPE_REQUEST, QUERY_VALUE_PAGE_CURSOR_TYPE_SPECIFIC );
    params.set( QUERY_PARAM_PAGE_CURSOR_ID_REQUEST, nextCursor );

    const modifiedUrl = new URL(urlObj.origin + urlObj.pathname);
    modifiedUrl.search = params.toString();
    rUpdating.current = true;
    setUrlCursorObj( x => modifiedUrl.href );
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
        const x = structuredClone( parsedJsonObject );

        const validStatus = x[QUERY_RESPONSE_KEY_SUCCESS];
        if (isNil(validStatus) || !validStatus) {
          throw new Error( 'invalid data' );
        }

        processQueryData( x );
        setNotionData( d => x );
        setFilteredNotionData( x => searchAndSortData(
          x, rSearchObj.current, rSortObj.current
        ) );
      }
      catch( err ) {
        console.log( err );
        setNotionData( x => {
          return {
            [IDGMD_VALID_DATA]: false,
          };
        } );
      }
      finally {
        rUpdating.current = false;
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

        if (CRUD_RESPONSE_RESULT in crudJson) {
          const result = crudJson[CRUD_RESPONSE_RESULT];
          const resultType = crudJson[CRUD_RESPONSE_RESULT_TYPE];
          const success = result[resultType];
          if (resultType === CRUD_RESPONSE_DELETE && success) {
            const delId = result[CRUD_RESPONSE_DELETE_ID];
            setNotionData( x => spliceNotionPage( x, delId ) );
          }
          else if (resultType === CRUD_RESPONSE_CREATE && success) {
            const pg = result[CRUD_RESPONSE_PAGE];
            const dbId = result[CRUD_RESPONSE_DB_ID];

            const updateNotionData = x => {
              const clone = structuredClone( x );
              const dbBlocks = getNotionDataPages( clone, dbId );
              dbBlocks.unshift( pg );
              return clone;
            };

            setNotionData( x => updateNotionData(x) );
          }
          else if (resultType === CRUD_RESPONSE_UPDATE && success) {
            const pg = result[CRUD_RESPONSE_PAGE];
            const dbId = result[CRUD_RESPONSE_DB_ID];
            const pgId = result[CRUD_RESPONSE_UPDATE_ID];

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

            setNotionData( x => updateNotionData(x) );
          }
        }
      }
      catch ( err ) {
        console.log( err );
      }
      finally {
        rUpdating.current = false;
        setUrlUpdateObj( x => null );
      }
    };

    if (!isNil(urlUpdateObj) && rUpdating.current) {
      fetchData();
    }

  }, [
    notionData,
    urlUpdateObj
  ] );

  //load more cursors
  useEffect( () => {

    async function fetchData() {
      try {
        const cursorResponse = await fetch( urlCursorObj );
        const cursorJson = await cursorResponse.json( );
        const y = structuredClone( cursorJson );
        const validStatus = y[QUERY_RESPONSE_KEY_SUCCESS];
        if (isNil(validStatus) || !validStatus) {
          throw new Error( 'invalid data' );
        }

        const updateNotionData = x => {
          const x2 = structuredClone( x );
          processQueryData( y );

          const primaryDbId = getNotionDataPrimaryDbId( x2 );
          const exsPrimaryPgs = getNotionDataPages( x2, primaryDbId );
          const newPrimaryPgs = getNotionDataPages( y, primaryDbId );
          const mergedPrimaryPgs = mergePageLists( exsPrimaryPgs, newPrimaryPgs );
          y[IDGMD_DATA][DGMD_PRIMARY_DATABASE][DGMD_BLOCKS] = mergedPrimaryPgs;

          const previewDbIds = getNotionDataRelationDbIds( x2 );
          for (const previewDbId of previewDbIds) {
            const exsPreviewPgs = getNotionDataPages( x2, previewDbId );
            const newPreviewPgs = getNotionDataPages( y, previewDbId );
            const mergedPreviewPgs = mergePageLists( exsPreviewPgs, newPreviewPgs );
            y[IDGMD_DATA][DGMD_RELATION_DATABASES].find( 
              db => db[DGMD_DATABASE_ID] === previewDbId )[DGMD_BLOCKS] = mergedPreviewPgs;
          }

          return y;
        };

        setNotionData( x => updateNotionData(x) );
      }
      catch ( err ) {
        console.log( err );
      }
      finally {
        setUrlCursorObj( x => null );
        rUpdating.current = false;
      }
    };

    if (!isNil(urlCursorObj) && rUpdating.current) {
      fetchData();
    }

  }, [
    urlCursorObj
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
    handleNextCursor,
    notionData,
    filteredNotionData,
    updating: rUpdating.current
  };
};

const searchAndSortData = ( jsonObject, search, sort ) => {
  const searchEntries = isNil(search) ? [] : Object.entries(search);
  const sortEntries = isNil(sort) ? [] : Object.entries(sort);

  const primaryDbId = getNotionDataPrimaryDbId( jsonObject );
  const relationDbIds = getNotionDataRelationDbIds( jsonObject );
  const allDbClones = [ primaryDbId, ...relationDbIds ].reduce( (acc, dbId) => {
    const x = structuredClone( jsonObject );
    acc[dbId] = x[IDGMD_DATA];

    //search
    for (const [searchDbId, searchObj] of searchEntries) {
      searchPages( x, searchDbId, searchObj );
    }

    //sort
    for (const [sortDbId, sortRules] of sortEntries) {
      const spgs = getNotionDataPages( x, sortDbId );
      const fields = isArray(sortRules.fields) ? sortRules.fields : [];
      const directions = isArray(sortRules.directions) ? sortRules.directions : [];
      sortPages( spgs, fields, directions );
    }

    return acc;
  }, {} );

  const y = {
    [IDGMD_VALID_DATA]: jsonObject[IDGMD_VALID_DATA],
    [IDGMD_LIVE_DATA]: jsonObject[IDGMD_LIVE_DATA],
    [IDGMD_FILTERED_DATA]: true,
    [IDGMD_DATA]: allDbClones
  };

  Object.freeze( y );
  return y;
};

const processQueryData = ( jsonObject ) => {
  const parsePrimaryDbId = (x) => {
    const job = x[IDGMD_DATA];
    return job[DGMD_PRIMARY_DATABASE][DGMD_DATABASE_ID];
  };
    
  const parseRelationDbIds = (x) => {
    const job = x[IDGMD_DATA];
    return job[DGMD_RELATION_DATABASES].map( db => db[DGMD_DATABASE_ID] );
  };
  
  delete jsonObject[QUERY_RESPONSE_KEY_SUCCESS];
  jsonObject[IDGMD_FILTERED_DATA] = false;
  jsonObject[IDGMD_LIVE_DATA] = !isNil(jsonObject[PROTO_RESPONSE_KEY_SNAPSHOT_TIMESTAMP]) || true;
  delete jsonObject[PROTO_RESPONSE_KEY_SNAPSHOT_TIMESTAMP];
  jsonObject[IDGMD_DATA] = jsonObject[QUERY_RESPONSE_KEY_RESULT];
  delete jsonObject[QUERY_RESPONSE_KEY_RESULT];
  jsonObject[IDGMD_VALID_DATA] = true;
  jsonObject[IDGMD_PRIMARY_DBID] = parsePrimaryDbId( jsonObject );
  jsonObject[IDGMD_RELATION_DBIDS] = parseRelationDbIds( jsonObject );
  return jsonObject;
};