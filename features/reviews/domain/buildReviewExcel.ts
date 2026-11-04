import { strToU8, zipSync } from "fflate";
import type {
  ExcelCell,
  ReviewExcelReport,
  ReviewExcelSheet,
} from "./reviewExcelReport";

const spreadsheet = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const relationships =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const chartNamespace = "http://schemas.openxmlformats.org/drawingml/2006/chart";
const drawingNamespace =
  "http://schemas.openxmlformats.org/drawingml/2006/main";
const colors = ["2459D3", "0F766E", "8B5CB5", "D58A24", "52667F", "B34D65"];

function xml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function column(index: number): string {
  let name = "";
  for (let n = index + 1; n; n = Math.floor((n - 1) / 26))
    name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  return name;
}

function cells(
  values: ExcelCell[],
  row: number,
  numericStyle: number,
  header = false,
): string {
  return `<row r="${row}"${header ? ' ht="42" customHeight="1"' : ""}>${values
    .map((value, index) => {
      const ref = `${column(index)}${row}`;
      if (value === null) return `<c r="${ref}" s="${numericStyle}"/>`;
      if (typeof value === "number") {
        if (!Number.isFinite(value)) throw new Error("INVALID_EXCEL_NUMBER");
        return `<c r="${ref}" s="${numericStyle}"><v>${value}</v></c>`;
      }
      // Inline strings keep source labels literal, including leading =, +, - and @.
      return `<c r="${ref}" s="${header ? 1 : 0}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
    })
    .join("")}</row>`;
}

function rels(items: { id: string; type: string; target: string }[]): string {
  return `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${items
    .map(
      (item) =>
        `<Relationship Id="${item.id}" Type="${relationships}/${item.type}" Target="${xml(item.target)}"/>`,
    )
    .join("")}</Relationships>`;
}

function chart(
  sheet: ReviewExcelSheet,
  locale: ReviewExcelReport["locale"],
): string {
  const headers = sheet.rows[0].slice(1);
  const lastColumn = column(headers.length);
  const sheetRef = `'${sheet.name.replace(/'/g, "''")}'`;
  const series = sheet.rows
    .slice(1)
    .map((row, index) => {
      const rowNumber = index + 2;
      const values = row.slice(1);
      const points = values
        .map((value, i) =>
          typeof value === "number"
            ? `<c:pt idx="${i}"><c:v>${value}</c:v></c:pt>`
            : "",
        )
        .join("");
      const categories = headers
        .map(
          (value, i) =>
            `<c:pt idx="${i}"><c:v>${xml(String(value))}</c:v></c:pt>`,
        )
        .join("");
      return `<c:ser><c:idx val="${index}"/><c:order val="${index}"/>
      <c:tx><c:strRef><c:f>${xml(`${sheetRef}!$A$${rowNumber}`)}</c:f><c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>${xml(String(row[0]))}</c:v></c:pt></c:strCache></c:strRef></c:tx>
      <c:spPr><a:solidFill><a:srgbClr val="${colors[index % colors.length]}"/></a:solidFill><a:ln><a:noFill/></a:ln></c:spPr>
      <c:cat><c:strRef><c:f>${xml(`${sheetRef}!$B$1:$${lastColumn}$1`)}</c:f><c:strCache><c:ptCount val="${headers.length}"/>${categories}</c:strCache></c:strRef></c:cat>
      <c:val><c:numRef><c:f>${xml(`${sheetRef}!$B$${rowNumber}:$${lastColumn}$${rowNumber}`)}</c:f><c:numCache><c:formatCode>${sheet.format}</c:formatCode><c:ptCount val="${values.length}"/>${points}</c:numCache></c:numRef></c:val>
    </c:ser>`;
    })
    .join("");
  return `<c:chartSpace xmlns:c="${chartNamespace}" xmlns:a="${drawingNamespace}">
    <c:lang val="${locale === "it" ? "it-IT" : "en-US"}"/>
    <c:chart><c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="${locale}" sz="1400"/><a:t>${xml(sheet.title)}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title><c:autoTitleDeleted val="0"/>
    <c:plotArea><c:layout/><c:barChart><c:barDir val="col"/><c:grouping val="clustered"/><c:varyColors val="0"/>${headers.length ? series : ""}<c:gapWidth val="100"/><c:overlap val="0"/><c:axId val="100"/><c:axId val="200"/></c:barChart>
    <c:catAx><c:axId val="100"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:axPos val="b"/><c:tickLblPos val="nextTo"/><c:crossAx val="200"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/></c:catAx>
    <c:valAx><c:axId val="200"/><c:scaling><c:orientation val="minMax"/>${sheet.maximum === undefined ? "" : `<c:max val="${sheet.maximum}"/>`}<c:min val="0"/></c:scaling><c:axPos val="l"/><c:majorGridlines/><c:numFmt formatCode="${sheet.format}" sourceLinked="0"/><c:tickLblPos val="nextTo"/><c:crossAx val="100"/><c:crosses val="autoZero"/><c:crossBetween val="between"/></c:valAx>
    </c:plotArea><c:legend><c:legendPos val="b"/><c:layout/><c:overlay val="0"/></c:legend><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart>
  </c:chartSpace>`;
}

function drawing(row: number, name: string, width: number): string {
  return `<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="${drawingNamespace}">
    <xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${row}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:ext cx="${width * 9525}" cy="4191000"/>
    <xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="2" name="${xml(name)}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="${chartNamespace}"><c:chart xmlns:c="${chartNamespace}" xmlns:r="${relationships}" r:id="chart"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:oneCellAnchor>
  </xdr:wsDr>`;
}

// Native SpreadsheetML charts reference worksheet cells so Excel can edit both.
export function buildReviewExcel(
  report: ReviewExcelReport,
): Uint8Array<ArrayBuffer> {
  const files: Record<string, Uint8Array> = {};
  const add = (path: string, body: string) => {
    files[path] = strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${body}`,
    );
  };
  const overrides: string[] = [];
  const override = (part: string, type: string) =>
    overrides.push(
      `<Override PartName="/${part}" ContentType="application/vnd.openxmlformats-officedocument.${type}+xml"/>`,
    );
  add(
    "_rels/.rels",
    rels([
      { id: "workbook", type: "officeDocument", target: "xl/workbook.xml" },
    ]),
  );
  add(
    "xl/workbook.xml",
    `<workbook xmlns="${spreadsheet}" xmlns:r="${relationships}"><bookViews><workbookView/></bookViews><sheets>${report.sheets.map((sheet, i) => `<sheet name="${xml(sheet.name)}" sheetId="${i + 1}" r:id="sheet${i + 1}"/>`).join("")}</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`,
  );
  add(
    "xl/_rels/workbook.xml.rels",
    rels([
      ...report.sheets.map((_, i) => ({
        id: `sheet${i + 1}`,
        type: "worksheet",
        target: `worksheets/sheet${i + 1}.xml`,
      })),
      { id: "styles", type: "styles", target: "styles.xml" },
    ]),
  );
  override("xl/workbook.xml", "spreadsheetml.sheet.main");
  override("xl/styles.xml", "spreadsheetml.styles");
  add(
    "xl/styles.xml",
    `<styleSheet xmlns="${spreadsheet}">
    <numFmts count="3"><numFmt numFmtId="164" formatCode="#,##0"/><numFmt numFmtId="165" formatCode="0.00"/><numFmt numFmtId="166" formatCode="0.0%"/></numFmts>
    <fonts count="2"><font><sz val="11"/><color rgb="FF18263E"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>
    <fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2459D3"/><bgColor indexed="64"/></patternFill></fill></fills>
    <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
    <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
    <cellXfs count="6"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>${[164, 165, 166].map((id) => `<xf numFmtId="${id}" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>`).join("")}<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf></cellXfs>
    <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  </styleSheet>`,
  );
  report.sheets.forEach((sheet, i) => {
    const id = i + 1;
    const numericStyle =
      sheet.format === "#,##0" ? 2 : sheet.format === "0.00" ? 3 : 4;
    const chartRow = Math.max(9, sheet.rows.length + 2);
    const noteRow = chartRow + 25;
    const sampleRow = noteRow + sheet.notes.length + 2;
    const lastColumn = column(Math.max(7, sheet.rows[0].length));
    const noteMerges = sheet.notes
      .map(
        (_, index) =>
          `<mergeCell ref="A${noteRow + index}:${lastColumn}${noteRow + index}"/>`,
      )
      .join("");
    const notes = sheet.notes
      .map(
        (note, index) =>
          `<row r="${noteRow + index}" ht="44" customHeight="1"><c r="A${noteRow + index}" s="5" t="inlineStr"><is><t>${xml(note)}</t></is></c></row>`,
      )
      .join("");
    add(
      `xl/worksheets/sheet${id}.xml`,
      `<worksheet xmlns="${spreadsheet}" xmlns:r="${relationships}">
      <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="20"/>
      <cols><col min="1" max="1" width="18" customWidth="1"/><col min="2" max="2" width="34" customWidth="1"/><col min="3" max="${Math.max(8, sheet.rows[0].length + 1)}" width="24" customWidth="1"/></cols>
      <sheetData>${sheet.rows.map((row, index) => cells(row, index + 1, numericStyle, index === 0)).join("")}${notes}${sheet.samples.map((row, index) => cells(row, sampleRow + index, 2, index === 0)).join("")}</sheetData>
      <mergeCells count="${sheet.notes.length}">${noteMerges}</mergeCells>
      <pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/><drawing r:id="drawing"/>
    </worksheet>`,
    );
    add(
      `xl/worksheets/_rels/sheet${id}.xml.rels`,
      rels([
        {
          id: "drawing",
          type: "drawing",
          target: `../drawings/drawing${id}.xml`,
        },
      ]),
    );
    add(
      `xl/drawings/drawing${id}.xml`,
      drawing(chartRow, sheet.title, Math.max(880, sheet.rows[0].length * 150)),
    );
    add(
      `xl/drawings/_rels/drawing${id}.xml.rels`,
      rels([
        { id: "chart", type: "chart", target: `../charts/chart${id}.xml` },
      ]),
    );
    add(`xl/charts/chart${id}.xml`, chart(sheet, report.locale));
    override(`xl/worksheets/sheet${id}.xml`, "spreadsheetml.worksheet");
    override(`xl/drawings/drawing${id}.xml`, "drawing");
    override(`xl/charts/chart${id}.xml`, "drawingml.chart");
  });
  add(
    "[Content_Types].xml",
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${overrides.join("")}</Types>`,
  );
  return zipSync(files, { level: 6, mtime: new Date("2000-01-01T00:00:00Z") });
}
