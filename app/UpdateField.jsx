
import {
  useState,
  useRef
} from 'react';

import {
  linkStyle,
  sectionStyle,
  textAreaStyle
} from "./Look";

export const UpdateField = ({dbId, pageId, onUpdate}) => {

  const updateRef = useRef( null );
  const [sortTerms, setSortTerms] = useState( null );

  return (
    <div
      style={ sectionStyle }
    >
      <textarea
        rows={ 2 }
        cols={ 30 }
        style={ textAreaStyle }
        ref={ updateRef }
        value={ sortTerms ? sortTerms : '' }
        onChange={ x => setSortTerms( x.target.value ) }
      />
      <div
        style={ linkStyle }
        onClick={ () => {
          try {
            const updateTerms = JSON.parse( updateRef.current.value );
            const val = {
              [dbId]: {
                [pageId]: updateTerms
              }
            };
            onUpdate( val );
          }
          catch (e) {
            console.log( e );
          }
        } }
      >
        UPDATE PAGE
      </div>
    </div>
  );
};