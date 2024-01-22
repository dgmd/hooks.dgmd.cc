
//
//  UTILS
//
export const uniqueKey = () => 
  Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');


//todo: delete when move to server
export const deriveBoolean = ( value ) => {
  const str = String( value );
  const strLowTrim = str.toLowerCase().trim();
  return [
    'true',
    '1',
    'yes',
    'y',
    'on'
  ].includes( strLowTrim );
};