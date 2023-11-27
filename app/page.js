"use client"

import {
  BLOCK_TYPE_DATE,
  BLOCK_TYPE_EMOJI,
  BLOCK_TYPE_FILE_EXTERNAL,
  BLOCK_TYPE_RELATION,
  BLOCK_TYPE_RICH_TEXT,
  BLOCK_TYPE_TITLE,
  DGMDCC_BLOCK_TYPE,
  DGMDCC_BLOCK_VALUE,
  DGMDCC_BLOCK_DATE_START,
  DGMDCC_BLOCK_DATE_END,
  getPageId,
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
    // 'http://localhost:3000/api/query?d=529a56b3cc2b44798a98e5e0c39ffa47&b=false&r=true' );
    'http://localhost:3000/api/prototype?i=ad16fb5b-5a52-4bcc-b663-0ea870565599' );

  const cbUpdatePage = useCallback( (dbId, pageId) => {
    if (!nata || !nata.isValid()) {
      return;
    }
    const updatePageObj = {
      "Name": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_TITLE,
        [DGMDCC_BLOCK_VALUE]: "updated" + Math.floor(Math.random() * 100)
       },
      "🗿 PUB CUSTOMERS": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_RELATION,
        [DGMDCC_BLOCK_VALUE]: [
          'fa3fd539b88148beadfd8d4628bb941f'
        ]
      },
      "Date": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_DATE,
        [DGMDCC_BLOCK_VALUE]: {
          [DGMDCC_BLOCK_DATE_START]: "2043-11-02",
          [DGMDCC_BLOCK_DATE_END]: "2193-11-02T00:00:00.000-04:00",
        }
      }
    };
    const updatePageMetaObj = {
      'icon': {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_EMOJI,
        [DGMDCC_BLOCK_VALUE]: "😊"
      }
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
      "blurb": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_RICH_TEXT,
        [DGMDCC_BLOCK_VALUE]: "rich text here, yes there is "+ Math.floor(Math.random() * 100)
      },
      // "yepchecky": {
      //   [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_CHECKBOX,
      //   [DGMDCC_BLOCK_VALUE]: true
      // },
      // "Tags": {
      //   [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_MULTI_SELECT,
      //   [DGMDCC_BLOCK_VALUE]: [
      //    null,
      //    "tag2"
      //   ]
      // },
      // "Status": {
      //   [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_STATUS,
      //   [DGMDCC_BLOCK_VALUE]: "wakaka"
      // },
      // "numberfield": {
      //   [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_NUMBER,
      //   [DGMDCC_BLOCK_VALUE]: 42
      // },
      // "selecty": {
      //   [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_SELECT,
      //   [DGMDCC_BLOCK_VALUE]: "red"
      // },
      // "ringring": {
      //   [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_PHONE_NUMBER,
      //   [DGMDCC_BLOCK_VALUE]: "1234567890"
      // },
      // "kewl_urrrrls": {
      //   [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_URL,
      //   [DGMDCC_BLOCK_VALUE]: "ftp://warez.ie"
      // },
      // "yerrremails": {
      //   [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_EMAIL,
      //   [DGMDCC_BLOCK_VALUE]: "joemail<at>gmail.com"
      // },
      // "rich": {
      //   [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_RICH_TEXT,
      //   [DGMDCC_BLOCK_VALUE]: "rich text here, yes there is"
      // },
      // "mydate": {
      //   [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_DATE,
      //   [DGMDCC_BLOCK_VALUE]: {
      //     [DGMDCC_BLOCK_DATE_START]: "2043-11-02T00:00:00.000-04:00",
      //     // [DGMDCC_BLOCK_DATE_END]: "2093-11-02T00:00:00.000-04:00",
      //   }
      // }
    };
    const pageMetaObj = {
      'icon': {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_EMOJI,
        [DGMDCC_BLOCK_VALUE]: "🥨"
      },
      'cover': {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_FILE_EXTERNAL,
        [DGMDCC_BLOCK_VALUE]: "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
      }
    };
    nata.createPage( dbId, createPageObj, pageMetaObj );
  }, [
    nata
  ] );

  const cbSortPages = useCallback( dbId => {
    if (!nata || !nata.isValid()) {
      return;
    }
    nata.sortPages( dbId, ['Name'], [false] );
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
      <div
        onClick={ () => cbSortPages(dbId) }
        style={linkStyle}
      >
        SORT
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
