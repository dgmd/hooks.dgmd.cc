'use client'

import {
  useEffect,
  useState
} from 'react';
import {
  BLOCK_TYPE_RICH_TEXT,
  DGMDCC_BLOCK_PROPERTIES,
  DGMDCC_BLOCK_TYPE,
  DGMDCC_BLOCK_VALUE,
  useNotionData
} from '../../hooks/notionDataHook.js';

export default function Batch() {

  const [
    nata,
    nataJSON,
    crudding
  ] = useNotionData(
    'http://localhost:3000/api/query?d=b084ed437f9446298f77443672c1cbb0&b=false&r=true' );


  const [newAccounts, setNewAccounts] = useState( x => [] );
  const [newAccountIdx, setNewAccountIdx] = useState( x => 0 );


  useEffect( () => {
    if (!nata || !nata.isValid() || crudding) {
      return;
    }
    if (newAccountIdx >= newAccounts.length) {
      return;
    }
    const createPageObj = {
      "blurb": {
        [DGMDCC_BLOCK_TYPE]: BLOCK_TYPE_RICH_TEXT,
        [DGMDCC_BLOCK_VALUE]: newAccounts[newAccountIdx]
      }
    };
    nata.createPage( 
      nata.getPrimaryDbId( null ),
      createPageObj,
      {}
    );
    setNewAccountIdx( x => x + 1 );
  }, [
    newAccountIdx, 
    newAccounts,
    nata,
    crudding
  ]);

  if (!nata || !nata.isValid()) {
    return null;
  }

  return (
    <div>
      <button onClick={ () => {
        setNewAccounts( x => {
          return generateGibberishStrings(10, 10);
        } );
        setNewAccountIdx( x => 0 );
      } }>
        Generate new accounts
      </button>
      <div>
        NEW ACCOUNTS
      </div>
      {
        newAccounts.map( (account, index) => {
          return (
            <div 
              key={account}>
              {account}
            </div>
          )
        } )
      }
      <div>
        ACCOUNTS IN DB
      </div>
      {
      nata.getPages( nata.getPrimaryDbId( null ) ).map( (pg, i) => {
        return (
          <div 
            key={i}
            style={ { 
              color: '#f00'
            } }
          >
            {
              pg[DGMDCC_BLOCK_PROPERTIES]['blurb'][DGMDCC_BLOCK_VALUE]
            }
          </div>)
      } )
      }
    </div>
  )
}

const generateGibberishStrings = (n, length) => {
  // Set characters to use for gibberish
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  // Function to generate a single string
  function generateString() {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // Generate n strings and store them in an array
  const gibberishStrings = [];
  for (let i = 0; i < n; i++) {
    gibberishStrings.push(generateString());
  }

  return gibberishStrings;
};