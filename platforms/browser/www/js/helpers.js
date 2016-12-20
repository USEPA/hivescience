import _ from "underscore"

export const formatAttributes = (attributes) => {
  return _.reduce(attributes, (acc, elem) => {
    acc[elem.name] = elem.value;
    return acc;
  }, {});
};