
import {
  useLayoutEffect,
  useRef,
  useState
} from 'react';

import {
  headerStyle,
  linkStyle,
  sectionStyle,
  textAreaStyle
} from './Look.js';

import {
  getNotionDataAllDbIds
} from './hook/dataUtils.js';

import {
  SEARCH_TYPE,
  SEARCH_TYPE_SIMPLE,
  SEARCH_INFO,
  SEARCH_QUERY,
  SEARCH_DEPTH
} from './hook/constants.js';

export const SearchField = ({notionData, onSearch}) => {

  const searchTextAreaRef = useRef( null );
  const [searchTerms, setSearchTerms] = useState( null );

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
            [SEARCH_DEPTH]: 0
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
    >
      SEARCH
    </div>
    <textarea
      rows={ 10 }
      cols={ 30 }
      style={ textAreaStyle }
      ref={ searchTextAreaRef }
      value={ searchTerms ? searchTerms : '' }
      onChange={ e => setSearchTerms( e.target.value ) }
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
          console.log( 'not valid json' );
          console.log( err );
        }
      } }
    >
      DO THE SEARCHING
    </div>
    </div>
  );
}