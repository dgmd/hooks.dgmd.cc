"use client"

import {
  BLOCK_TYPE_CHECKBOX,
  BLOCK_TYPE_DATE,
  BLOCK_TYPE_EMAIL,
  BLOCK_TYPE_MULTI_SELECT,
  BLOCK_TYPE_NUMBER,
  BLOCK_TYPE_PHONE_NUMBER,
  BLOCK_TYPE_RICH_TEXT,
  BLOCK_TYPE_SELECT,
  BLOCK_TYPE_STATUS,
  BLOCK_TYPE_TITLE,
  BLOCK_TYPE_URL,
  DGMDCC_BLOCK_DATE_END,
  DGMDCC_BLOCK_DATE_START,
  DGMDCC_BLOCK_ID,
  DGMDCC_BLOCK_TYPE,
  DGMDCC_BLOCK_VALUE,
  useNotionData
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

  const cbUpdatePage = useCallback( (dbId, pageId) => {
    const updatePageObj = {
      "Title": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_TITLE,
        [DGMDCC_BLOCK_VALUE]: "updated" + Math.floor(Math.random() * 100)
       },
    };
    nata.updatePage( dbId, pageId, updatePageObj );
  }, [
    nata
  ] );

  const cbCreatePage = useCallback( dbId => {
    const createPageObj = {
      "Title": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_TITLE,
        [DGMDCC_BLOCK_VALUE]: "created"+ Math.floor(Math.random() * 100)
       },
      "yepchecky": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_CHECKBOX,
        [DGMDCC_BLOCK_VALUE]: true
      },
      "Tags": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_MULTI_SELECT,
        [DGMDCC_BLOCK_VALUE]: [
         null,
         "tag2"
        ]
      },
      "Status": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_STATUS,
        [DGMDCC_BLOCK_VALUE]: "wakaka"
      },
      "numberfield": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_NUMBER,
        [DGMDCC_BLOCK_VALUE]: 42
      },
      "selecty": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_SELECT,
        [DGMDCC_BLOCK_VALUE]: "red"
      },
      "ringring": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_PHONE_NUMBER,
        [DGMDCC_BLOCK_VALUE]: "1234567890"
      },
      "kewl_urrrrls": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_URL,
        [DGMDCC_BLOCK_VALUE]: "ftp://warez.ie"
      },
      "yerrremails": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_EMAIL,
        [DGMDCC_BLOCK_VALUE]: "joemail<at>gmail.com"
      },
      "rich": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_RICH_TEXT,
        [DGMDCC_BLOCK_VALUE]: "rich text here, yes there is"
      },
      "mydate": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_DATE,
        [DGMDCC_BLOCK_VALUE]: {
          [DGMDCC_BLOCK_DATE_START]: "2043-11-02T00:00:00.000-04:00",
          // [DGMDCC_BLOCK_DATE_END]: "2093-11-02T00:00:00.000-04:00",
        }
      }
    };
    nata.createPage( dbId, createPageObj );
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
        style={linkStyle}
      >
        CREATE
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
              <pre>
              { JSON.stringify( page, null, 1 ) }
              </pre>
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
                    nata.deletePage( dbId, page[DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE] );
                  } }
                  style={linkStyle}
                >
                DELETE
                </div>
                <div
                  onClick={ () => {
                    cbUpdatePage( dbId, page[DGMDCC_BLOCK_ID][DGMDCC_BLOCK_VALUE] );
                  } }
                  style={linkStyle}                
                >
                UPDATE
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
