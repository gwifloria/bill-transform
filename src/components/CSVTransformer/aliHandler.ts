import { aliConfig } from "./config";

export const aliHandler = (data: string[][]) => {
  const headerIdx = data.findIndex((row) => row[0]?.trim() === "交易时间");
  if (headerIdx === -1) return [];

  const dataRows = data.slice(headerIdx + 1);
  const map = new Map<string, string>();
  const result: string[][] = [];

  dataRows.forEach((row) => {
    const name = (row[aliConfig.nameIdx] ?? "").trim();
    let value = (row[aliConfig.valueIndex] ?? "0").trim();

    if (name.includes("余额宝")) return;

    if (name.includes("退款")) {
      const originalName = name.split("-")[1];
      if (originalName) map.set(originalName, value);
    } else if (map.has(name)) {
      value = (Number(value) - Number(map.get(name))).toFixed(2);
      if (value !== "0.00") {
        row[aliConfig.valueIndex] = value;
        result.push(row);
      }
    } else {
      result.push(row);
    }
  });

  return result;
};
