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
  IDGMD_DATA,
  IDGMD_FILTERED_DATA,
  IDGMD_LIVE_DATA,
  IDGMD_PRIMARY_DBID,
  IDGMD_RELATION_DBIDS,
  IDGMD_VALID_DATA
} from './constants.js';
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
    console.log( 'handleNextCursor' );
    setUrlCursorObj( x => null );
    return true;
  }, [
    notionData,
    urlObj
  ] );

  //load notion data
  useEffect( () => {

    const parsePrimaryDbId = (jsonObject) => {
      const job = jsonObject[IDGMD_DATA];
      return job[DGMD_PRIMARY_DATABASE][DGMD_DATABASE_ID];
    };
      
    const parseRelationDbIds = (jsonObject) => {
      const job = jsonObject[IDGMD_DATA];
      return job[DGMD_RELATION_DATABASES].map( db => db[DGMD_DATABASE_ID] );
    };

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
        parsedJsonObject[IDGMD_FILTERED_DATA] = false;
        parsedJsonObject[IDGMD_LIVE_DATA] = !isNil(parsedJsonObject[PROTO_RESPONSE_KEY_SNAPSHOT_TIMESTAMP]) || true;
        delete parsedJsonObject[PROTO_RESPONSE_KEY_SNAPSHOT_TIMESTAMP];
        parsedJsonObject[IDGMD_DATA] = parsedJsonObject[QUERY_RESPONSE_KEY_RESULT];
        delete parsedJsonObject[QUERY_RESPONSE_KEY_RESULT];
        parsedJsonObject[IDGMD_VALID_DATA] = true;

        parsedJsonObject[IDGMD_PRIMARY_DBID] = parsePrimaryDbId( parsedJsonObject );
        parsedJsonObject[IDGMD_RELATION_DBIDS] = parseRelationDbIds( parsedJsonObject );

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
            [IDGMD_VALID_DATA]: false,
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

  useEffect( () => {
    async function fetchData() {
      console.log( 'urlCursorObj', urlCursorObj );
    };

    if (!isNil(urlCursorObj) && rUpdating.current) {
      fetchData();
    }

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