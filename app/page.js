"use client"

import {
  DGMDCC_ID,
  useNotionData,
  EXPORT_DATA_VALUE,
  EXPORT_DATA_TYPE,
  DGMDCC_URL
} from '../hooks/notionDataHook.js';

import {
  useCallback
} from 'react';

export default function Home() {

  const [
    nata,
    nataJSON,
    crudding
  ] = useNotionData(
    'http://localhost:3000/api/query?d=9c1a76dd5d1a4e93be590fd3ad3342d1&b=false&r=true' );
    // 'https://localhost:3000/api/prototype?i=36d25b62-70ac-4fcb-85c5-3acaf4f07429' );

  const cbDeletePage = useCallback( (dbId, pageId) => {
    nata.deletePage( dbId, pageId );
  }, [
    nata
  ] );

  const cbUpdatePage = useCallback( (dbId, pageId) => {
    const template = nata.getPageTemplate( dbId, !nata.isLiveData() );
    addJunk( template );
    nata.updatePage( dbId, pageId, template );
  }, [
    nata
  ] );

  const cbInsertPage = useCallback( dbId => {
    const template = nata.getPageTemplate( dbId, !nata.isLiveData() );
    addJunk( template );
    nata.insertPage( dbId, template );
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
        onClick={ () => cbInsertPage(dbId) }
        style={linkStyle}
      >
        INSERT
      </div>

      {
        nata.getPages( dbId ).map( ( page, i ) => {
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
              { JSON.stringify( page ) }
              <div
                style={{
                  paddingTop: '5px',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '5px'
                }}
              >
                <div
                  onClick={ () => {
                    cbDeletePage( dbId, page[DGMDCC_ID][EXPORT_DATA_VALUE] );
                  } }
                  style={linkStyle}
                >
                DELETE
                </div>
                <div
                  onClick={ () => {
                    cbUpdatePage( dbId, page[DGMDCC_ID][EXPORT_DATA_VALUE] );
                  } }
                  style={linkStyle}                
                >
                MODIFY
                </div>
              </div>
            </div>
          );
        })
      }

    </div>
  );
};

const linkStyle = {
  color: 'blue',
  textDecoration: 'underline',
  cursor: 'pointer'
};


const addJunk = ( template ) => {
  Object.values( template ).forEach( value => {
    if (![DGMDCC_ID, DGMDCC_URL].includes( value[EXPORT_DATA_TYPE] )) {
      if (Array.isArray( value[EXPORT_DATA_VALUE] )) {
        value[EXPORT_DATA_VALUE] = [
          makeRandoString( 6 )
        ];
      }
      else if (Number. isFinite( value[EXPORT_DATA_VALUE] )) {
        value[EXPORT_DATA_VALUE] = Math.floor( Math.random() * 100 );
      }
      else if (typeof value[EXPORT_DATA_VALUE] === "boolean") {
        value[EXPORT_DATA_VALUE] = !value[EXPORT_DATA_VALUE];
      }
      else {
        value[EXPORT_DATA_VALUE] = makeRandoString( 6 );
      }
    }
  } );
};

function makeRandoString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
