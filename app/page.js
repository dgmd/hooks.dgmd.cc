"use client"

import {
  BLOCK_TYPE_DATE,
  BLOCK_TYPE_EMOJI,
  BLOCK_TYPE_FILE_EXTERNAL,
  BLOCK_TYPE_RELATION,
  BLOCK_TYPE_RICH_TEXT,
  BLOCK_TYPE_TITLE,
  BLOCK_TYPE_NUMBER,
  DATE_PRETTY_SHORT_DATE,
  DATE_PRETTY_SHORT_NUMERIC_DATE,
  DGMDCC_BLOCK_DATE_END,
  DGMDCC_BLOCK_DATE_START,
  DGMDCC_BLOCK_PROPERTIES,
  DGMDCC_BLOCK_TYPE,
  DGMDCC_BLOCK_VALUE,
  getPageId,
  getPageProperty,
  getRelationData,
  prettyPrintNotionDate,
  getRelationDataFromPgId,
  useNotionData,
  SEARCH_TYPE,
  SEARCH_TYPE_COMPLEX,
  SEARCH_TYPE_DEPTH,
  SEARCH_TYPE_SIMPLE,
  SEARCH_INFO,
  SEARCH_DEPTH,
  SEARCH_FIELD,
  SEARCH_QUERY,
  SEARCH_INCLUDE,
  SEARCH_PROPERTY
} from '../hooks/notionDataHook.js';

import {
  useCallback,
  useState
} from 'react';

export default function Home() {

  const [
    nata,
    nataJSON,
    crudding
  ] = useNotionData(
    'http://localhost:3001/api/query?d=b7aa7231356a47d18ff271ffb641bc6c&b=false&r=true&c=d'
    // http://localhost:3001/api/query?d=b7aa7231356a47d18ff271ffb641bc6c&b=false&r=true&c=d
  );

  const [searchTerms, setSearchTerms] = useState( '' );


  const cbUpdatePage = useCallback( (dbId, pageId) => {
    if (!nata || !nata.isValid()) {
      return;
    }
    const updatePageObj = {
      'Name': {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_TITLE,
        [DGMDCC_BLOCK_VALUE]: 'New Title'
      }
    };
    const updatePageMetaObj = {
    };
    nata.updatePage( dbId, pageId, updatePageObj, updatePageMetaObj );
  }, [
    nata
  ] );

  const cbCreatePage = useCallback( dbId => {
    if (!nata || !nata.isValid()) {
      return;
    }
    const createPageObj = {
    };
    const pageMetaObj = {
    };
    nata.createPage( dbId, createPageObj, pageMetaObj );
  }, [
    nata
  ] );

  const cbSortPages = useCallback( dbId => {
    if (!nata || !nata.isValid()) {
      return;
    }
    nata.sortPages( dbId, ['Question'], [true] );
    // nata.sortPages( nata.getDbIdByName('Question'), ['Age'], [false] );
  }, [
    nata
  ] );

  if (!nata.isLoaded()) {
    return (<div>loading...</div>);
  }

  if (!nata.isValid()) {
    return (<div>invalid data</div>);
  }

  const dbId = nata.getPrimaryDbId( null );

  return (
    <div>
      <div>
        <b>DATA STATUS</b>: { nata.isLiveData() ? 'LIVE DATA' : 'SNAPSHOT DATA' }
      </div>
      <div>
        <b>CRUD STATUS</b>: { crudding ? 'ACTIVE' : 'INACTIVE' }
      </div>
      <div
        onClick={ () => cbCreatePage(dbId) }
        style={ linkStyle }
      >
        CREATE
      </div>
      <div
        onClick={ () => cbSortPages(dbId) }
        style={ linkStyle }
      >
        SORT
      </div>
      <input
        type="text"
        onChange={ (e) => {
          const searchTerms = e.target.value;
          setSearchTerms( searchTerms );

          // const searchObj = {
          //   [SEARCH_TYPE]: SEARCH_TYPE_SIMPLE,
          //   [SEARCH_INFO]: {
          //     [SEARCH_QUERY]: searchTerms,
          //     [SEARCH_DEPTH]: 1
          //   }
          // };

          const searchObj = {
            [SEARCH_TYPE]: SEARCH_TYPE_COMPLEX,
            [SEARCH_INFO]: [ {
              [SEARCH_PROPERTY]: true,
              [SEARCH_FIELD]: 'Question',
              [SEARCH_QUERY]: 'before',
              [SEARCH_INCLUDE]: false
            },
            // {
            //   [SEARCH_PROPERTY]: true,
            //   [SEARCH_FIELD]: 'Question',
            //   [SEARCH_QUERY]: 'popular',
            //   [SEARCH_INCLUDE]: true
            // },
            {
              [SEARCH_PROPERTY]: true,
              [SEARCH_FIELD]: 'Jaime CT',
              [SEARCH_QUERY]: 'CC',
              [SEARCH_INCLUDE]: true
            } ]
          };

          nata.searchPages( dbId, searchObj );
        } }
        value={ searchTerms }
      />

      {
        nata.hasNextCursor( ) && (
          <div
            onClick={ () => nata.loadNextCursor( ) }
            style={ linkStyle }
          >
            MORE
          </div>
        )
      }

      {
        nata.getSearchedPages( dbId ).map( ( page, i ) => {
          const pageId = getPageId( page );

          // const qs = nata.getRelationDataFromPg( page, 'Questions', 'Question' );


          return (
            <div
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                margin: '10px',
                backgroundColor: '#fff',
                color: '#000'
              }}
              key={ i }
            >
              <pre>
              { i }
              </pre>

              {
                getPageProperty( page, 'Question' )
              }
              {
                nata.getRelationDataFromPgId( dbId, pageId, 'Playlists', 'Age' )?.join( ', ' )
              }
              

              <div
                style={{
                  paddingTop: '2px',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '12px'
                }}
              >
                <div
                  onClick={ () => {
                    nata.deletePage( dbId, getPageId(page) );
                  } }
                  style={linkStyle}
                >
                DELETE
                </div>
                <div
                  onClick={ () => {
                    cbUpdatePage( dbId, getPageId(page) );
                  } }
                  style={linkStyle}                
                >
                UPDATE
                </div>
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
