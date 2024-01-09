
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

export const SortField = ({notionData, onSort}) => {

  const sortTextAreaRef = useRef( null );
  const [sortTerms, setSortTerms] = useState( null );

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

  return (
    <div
    style={ sectionStyle}
    >
    <div
      style={ headerStyle }
    >
      SORT
    </div>
    <textarea
      rows={ 10 }
      cols={ 30 }
      style={ textAreaStyle }
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
          onSort( sortTextObj );
        }
        catch( err ) {
          console.log( err );
        }
      } }
    >
      DO THE SORTING
    </div>
    </div>
  );
}