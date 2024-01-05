"use client"

import {
  useNotionData
} from './hook/notionDataHook.js';

import {
  getNotionDataPages,
  getNotionDataPrimaryDbId,
  isNotionDataLoaded,
  isNotionDataValid,
  isNotionDataLive,
  getNotionDataAllDbIds,
} from './hook/dataUtils.js';

import {
  getPageId
} from './hook/pageUtils.js';

import {
  useLayoutEffect,
  useRef,
  useState
} from 'react';

export default function Home() {

  const sortTextAreaRef = useRef( null );
  const [sortTerms, setSortTerms] = useState( null );

  const {
    setSearch,
    setSort,
    handleCreate,
    handleUpdate,
    handleDelete,
    notionData,
    filteredNotionData,
    updating
   } = useNotionData(
    "https://proto-dgmd-cc.vercel.app/api/prototype?i=7c3c07bd-512d-42e9-8f59-158cd1a0da79" );
    //"https://proto-dgmd-cc.vercel.app/api/query?d=ce748dc81b8444aba06b5cf5a0517fd7&b=false&r=true" );
    //"https://proto-dgmd-cc.vercel.app/api/prototype?i=0265f0e9-7571-427a-a8ea-39cae000db74" );
  
  useLayoutEffect( () => {
    if (!notionData) {
      return;
    }

    setSortTerms( x => {
      if (x) {
        return x;
      }
      const dbIds = getNotionDataAllDbIds( notionData );
      const sortObj = {};
      for (const dbId of dbIds) {
        sortObj[dbId] = {
          fields: [],
          directions: []
        };
      }
      return JSON.stringify( sortObj, null, 2 );
    } );
  }, [
    notionData
  ] );

  // const [searchTerms, setSearchTerms] = useState( '' );
  // const [searchIsJSON, setSearchIsJSON] = useState( false );

  // const cbUpdatePage = useCallback( (dbId, pageId) => {
  //   if (!nata || !nata.isValid()) {
  //     return;
  //   }
  //   const updatePageObj = {
  //   };
  //   const updatePageMetaObj = {
  //   };
  //   nata.updatePage( dbId, pageId, updatePageObj, updatePageMetaObj );
  // }, [
  //   nata
  // ] );

  // const cbCreatePage = useCallback( dbId => {
  //   if (!nata || !nata.isValid()) {
  //     return;
  //   }
  //   const createPageObj = {
  //   };
  //   const pageMetaObj = {
  //   };
  //   nata.createPage( dbId, createPageObj, pageMetaObj );
  // }, [
  //   nata
  // ] );

  // const cbSortPages = useCallback( dbId => {
  //   if (!nata || !nata.isValid()) {
  //     return;
  //   }
  //   nata.sortPages( dbId, ['Age'], [true] );
  //   // nata.sortPages( nata.getDbIdByName('Question'), ['Age'], [false] );
  // }, [
  //   nata
  // ] );

  if (!isNotionDataLoaded(notionData)) {
    return (<div>loading...</div>);
  }

  if (!isNotionDataValid(notionData)) {
    return (<div>invalid data</div>);
  }

  const dbId = getNotionDataPrimaryDbId( notionData );

  return (

    <div>

      <div
        style={sectionStyle}
      >
        <div
          style={ headerStyle }
        >
          DATA STATUS
        </div>
        <div>
          { isNotionDataLive(notionData) ? 'LIVE DATA' : 'SNAPSHOT DATA' }
        </div>
      </div>

      <div
        style={ sectionStyle}
      >
        <div
          style={ headerStyle }
        >
          UPDATING STATUS
        </div>
        <div>
          { updating ? 'ACTIVE' : 'INACTIVE' }
        </div>
      </div>

      <div
        style={ sectionStyle}
      >
        <div
          style={ headerStyle }
        >
          SORT
        </div>
        <textarea
          rows={10}
          cols={30}
          style={{
            border: `1px solid black`,
            padding: '10px',
            margin: '10px',
            backgroundColor: '#fff',
            color: '#000'
          }}
          ref={ sortTextAreaRef }
          value={ sortTerms ? sortTerms : '' }
          onChange={ e => setSortTerms( e.target.value ) }
        />
        <div
          style={ linkStyle }
          onClick={ () => {
            try {
              const sortText = sortTextAreaRef.current.value;
              const sortTextObj = JSON.parse( sortText );
              setSort( sortTextObj );
            }
            catch( err ) {
              console.log( err );
            }
          } }
        >
          DO THE SORTING
        </div>
      </div>

      <hr/>
      {
        getNotionDataPages( filteredNotionData, dbId ).map( ( page, i ) => {
          const pageId = getPageId( page );
          return (
          <div
            key={ pageId }
            style={{
              border: '1px solid black',
              margin: '10px',
            }}
          >
            pageId: { pageId }
            <br/>
            <div
              style={ linkStyle }
              onClick={ () => handleDelete( dbId, pageId ) }
            >
              DELETE PAGE
            </div>
          </div>
          );
        } )
      }

    </div>
  );
};

const linkStyle = {
  color: 'blue',
  textDecoration: 'underline',
  cursor: 'pointer'
};

const headerStyle = {
  fontSize: '20px',
  fontWeight: 'bold'
};

const sectionStyle = {
  border: '1px dashed gray',
  margin: '10px',
  padding: '10px'
};
