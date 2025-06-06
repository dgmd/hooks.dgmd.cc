
//
//  UTILS
//


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