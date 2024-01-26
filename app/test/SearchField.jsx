import {
  Fragment,
  useLayoutEffect,
  useRef,
  useState
} from 'react';

import {
  SEARCH_DEPTH,
  SEARCH_INFO,
  SEARCH_QUERY,
  SEARCH_TYPE,
  SEARCH_TYPE_SIMPLE
} from '../hook/constants.js';
import {
  getNotionDataAllDbIds
} from '../hook/dataUtils.js';
import {
  getTextAreaStyle,
  headerStyle,
  linkStyle,
  sectionStyle
} from './Look.js';

export const SearchField = ({notionData, onSearch, hasSearch}) => {

  const searchTextAreaRef = useRef( null );
  const [searchTerms, setSearchTerms] = useState( x => null );
  const [open, setOpen] = useState( x => false );

  useLayoutEffect( () => {
    if (!notionData) {
      return;
    }
    setSearchTerms( x => {
      if (x) {
        return x;
      }
      const dbIds = getNotionDataAllDbIds( notionData );
      const searchObj = {};
      for (const dbId of dbIds) {
        searchObj[dbId] = {
          [SEARCH_TYPE]: SEARCH_TYPE_SIMPLE,
          [SEARCH_INFO]: {
            [SEARCH_QUERY]: "",
            [SEARCH_DEPTH]: 1
          }
        };
      }
      return JSON.stringify( searchObj, null, 2 );
    } );
  }, [
    notionData
  ] );

  return (
    <div
      style={ sectionStyle }
    >
      <div
        style={ headerStyle }
        onClick={ x => setOpen( x => !x ) }
      >
        { open ? '⬇️' : '➡️' } SEARCH (active:{ hasSearch ? '✅' : '❌' })
      </div>
      {
        open ? (
          <Fragment>
            <textarea
              rows={ 10 }
              cols={ 30 }
              style={ getTextAreaStyle( hasSearch ) }
              ref={ searchTextAreaRef }
              value={ searchTerms ? searchTerms : '' }
              onChange={ e => {
                setSearchTerms( e.target.value );
              } }
            />
            <div
              style={ linkStyle }
              onClick={ () => {
                try {
                  const searchText = searchTextAreaRef.current.value;
                  const searchTextObj = JSON.parse( searchText );
                  onSearch( searchTextObj );
                }
                catch( err ) {
                  onSearch( null );
                  console.log( err );
                }
              } }
            >
              DO THE SEARCHING
            </div>
          </Fragment>
        ) :
        null
      }
    </div>
  );
}