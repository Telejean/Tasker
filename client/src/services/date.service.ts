export const formatDate = (date: any) => {
  const day = date.day;
  const month = date.month;
  const year = date.year;
  return `${day}/${month}/${year}`;
};

export const serializeDate = (date: any) => {
  const day = date.day;
  const month = date.month;
  const year = date.year;
  return new Date(`${year}-${month}-${day}`);
};
