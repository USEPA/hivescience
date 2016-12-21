import _ from "underscore"

export const formatAttributes = (attributes) => {
  return _.reduce(attributes, (acc, elem) => {
    if(acc[elem.name]) {
      acc[elem.name] += `, ${elem.value}`;
    } else {
      acc[elem.name] = elem.value;
    }
    return acc;
  }, {});
};