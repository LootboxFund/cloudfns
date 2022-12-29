export const csvCleaner = (obj: any): string => {
  if (typeof obj === "string") {
    return obj.replace(/,|\n|\r/g, "");
  } else if (typeof obj === "number") {
    return obj.toString();
  } else if (typeof obj === "boolean") {
    return obj ? "true" : "false";
  } else if (typeof obj === "object") {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "string") {
        return value.replace(/,|\n|\r/g, "");
      } else if (typeof value === "number") {
        return value.toString();
      } else if (typeof value === "boolean") {
        return value ? "true" : "false";
      }
      return value;
    });
  }
  return "";
};

export const parseCSVRows = (data: any[]): string => {
  var lineArray: string[] = [];
  data.forEach(function (row, index) {
    // If index == 0, then we are at the header row
    if (index == 0) {
      const titles = Object.keys(row);
      lineArray.push(titles.join(","));
    }

    const values = Object.values(row).map(csvCleaner);
    var line = values.join(",");
    lineArray.push(line);
  });
  var csvContent = lineArray.join("\n");

  return csvContent;
};
