import {
  headerStyle,
  sectionStyle
} from './Look.js';

export const UpdateStatus = ({title, status}) => {
  return (
  <div
    style={ sectionStyle }
  >
    <div
      style={ headerStyle }
    >
      { title }
    </div>
    <div>
      { status }
    </div>
  </div>
  );
};