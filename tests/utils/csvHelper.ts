import fs from "fs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

// Lee un CSV y lo convierte a objetos
export function readCsv(filePath: string) {
  const fileContent = fs.readFileSync(filePath, "utf-8");

  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });
}


// Filtra registros por columna + keyword
export function filterRecords(
  records: any[],
  column: string,
  keyword: string
) {
  const lowerKeyword = keyword.toLowerCase();

  return records.filter((row) =>
    row[column]?.toLowerCase().includes(lowerKeyword)
  );
}


// Genera un nuevo CSV filtrado y lo guarda en disco

export function createFilteredCsv(
  inputFilePath: string,
  outputFilePath: string,
  column: string,
  keyword: string
) {
  const records = readCsv(inputFilePath);

  const filtered = filterRecords(records, column, keyword);

  const csv = stringify(filtered, {
    header: true,
  });

  fs.mkdirSync(require("path").dirname(outputFilePath), { recursive: true });

  fs.writeFileSync(outputFilePath, csv, "utf-8");

  return {
    outputFilePath,
    totalOriginal: records.length,
    totalFiltered: filtered.length,
  };
}