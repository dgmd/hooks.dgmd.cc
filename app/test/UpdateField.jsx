
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

import {
  DGMDCC_BLOCK_METADATA,
  DGMDCC_BLOCK_PROPERTIES
} from '../hook/constants.js';

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
        [DGMDCC_BLOCK_PROPERTIES]: {},
        [DGMDCC_BLOCK_METADATA]: {}
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