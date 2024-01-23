import {
    DGMD_METADATA,
    DGMD_PROPERTIES
} from 'constants.dgmd.cc';
import {
    useLayoutEffect,
    useRef,
    useState
} from 'react';

import {
    getTextAreaStyle,
    linkStyle,
    sectionStyle
} from "./Look";

export const UpdateField = ({dbId, pageId, onUpdate}) => {

  const updateRef = useRef( null );
  const [sortTerms, setSortTerms] = useState( null );
  const [errorState, setErrorState] = useState( x => false );

  useLayoutEffect( () => {
    setSortTerms( x => {
      if (x) {
        return x;
      }
      return JSON.stringify( {
        [DGMD_PROPERTIES]: {},
        [DGMD_METADATA]: {}
      }, null, 2 );
    } );
  }, [
  ] );

  return (
    <div
      style={ sectionStyle }
    >
      <textarea
        rows={ 2 }
        cols={ 30 }
        style={ getTextAreaStyle(errorState) }
        ref={ updateRef }
        value={ sortTerms ? sortTerms : '' }
        onChange={ x => {
          setSortTerms( x.target.value );
          setErrorState( x => false );
        } }
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
            setErrorState( x => false );
          }
          catch (e) {
            console.log( e );
            setErrorState( x => true );
          }
        } }
      >
        UPDATE PAGE
      </div>
    </div>
  );
};