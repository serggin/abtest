const patternToDate = (value) => {
  const pattern = /(\d\d)\.(\d\d)\.(\d\d\d\d)/;
  const found = pattern.exec(value);
  if (found) {
    const date = new Date(found[3], found[2]-1, found[1]);
    if (date.getFullYear() == found[3] && date.getMonth()+1 == found[2] && date.getDate() == found[1]) {
      return date;
    }
  }
  return null;
};
const patternToUnixTime = (value) => {
  const date = patternToDate(value);
  if (date) {
    return (date.getTime() / 1000).toFixed(0);
  }
  return 0;
}
const todayToUnixTime = () => {
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDay());
  return (date.getTime() / 1000).toFixed(0);
}
const unixTimeToPattern = (value) => {
  const theDate = new Date(value * 1000);
  const date = theDate.getDate();
  const month = theDate.getMonth()+1;
  return `${(date<10 ? '0':'') + date}.${(month<10 ? '0':'') + month}.${theDate.getFullYear()}`;
}

export {patternToDate, patternToUnixTime, todayToUnixTime, unixTimeToPattern};
