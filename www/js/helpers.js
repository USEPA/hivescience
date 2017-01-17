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

export const toCamelCase = (string) => {
  const upperCaseMatcher = (match) => match[1].toUpperCase();
  return string.replace(/(\_\w)/g, upperCaseMatcher);
};

export const checkIfYes = (data) => {
  return data === "Y" ? "checked" : "";
};

export const checkIfNo = (data) => {
  return data === "N" ? "checked" : "";
};

export const ariaCheckIfYes = (data) => {
  return data === "Y" ? "true" : "false";
};

export const ariaCheckIfNo = (data) => {
  return data === "N" ? "true" : "false";
};