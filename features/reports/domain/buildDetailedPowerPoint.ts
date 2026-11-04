import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { buildReviewExcel } from "@/features/reviews/domain/buildReviewExcel";
import type { ReviewExcelSheet } from "@/features/reviews/domain/reviewExcelReport";
import type { Period } from "@/features/_shared/schemas/period";
import type { FrozenReportData } from "../schemas/frozenReportData";
import { reportWorkbook } from "./reportWorkbook";
import { reportLearnings } from "./reportLearnings";
import { reportsEN } from "../locales/en";
import { reportsIT } from "../locales/it";
const relNs = "http://schemas.openxmlformats.org/package/2006/relationships";
const office =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const drawing = "http://schemas.openxmlformats.org/drawingml/2006/main";
const chartNs = "http://schemas.openxmlformats.org/drawingml/2006/chart";
function xml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
function children(value: string): string[] {
  const result: string[] = [];
  let depth = 0,
    start = 0;
  for (const match of value.matchAll(/<[^>]+>/g)) {
    const token = match[0];
    if (token.startsWith("<?") || token.startsWith("<!")) continue;
    if (depth === 0) start = match.index;
    if (token.startsWith("</")) depth--;
    else if (!token.endsWith("/>")) depth++;
    if (depth === 0)
      result.push(value.slice(start, match.index + token.length));
  }
  if (depth !== 0) throw new Error("INVALID_POWERPOINT");
  return result;
}
/** Keep the organization's cover, master/theme and decorative chrome; replace generated chart images with deterministic native charts. */
export function buildDetailedPowerPoint(
  source: Uint8Array,
  data: FrozenReportData,
  period: Period,
  locale: "it" | "en",
  createdAt: string,
): Uint8Array {
  let expanded = 0;
  const files = unzipSync(source, {
    filter: (file) => {
      expanded += file.originalSize;
      if (expanded > 134217728 || file.originalSize > 33554432)
        throw new Error("INVALID_POWERPOINT");
      return true;
    },
  });
  const read = (name: string) => {
    if (!files[name]) throw new Error("INVALID_POWERPOINT");
    return strFromU8(files[name]);
  };
  const presentation = read("ppt/presentation.xml");
  const dimensions = presentation.match(
    /<p:sldSz\b[^>]*\bcx="(\d+)"[^>]*\bcy="(\d+)"/,
  );
  if (!dimensions) throw new Error("INVALID_POWERPOINT");
  const width = Number(dimensions[1]),
    height = Number(dimensions[2]);
  const presentationRels = read("ppt/_rels/presentation.xml.rels");
  const slideIds = [
    ...presentation.matchAll(/<p:sldId\b[^>]*\br:id="([^"]+)"[^>]*\/?\s*>/g),
  ].map((match) => match[1]);
  const relationships = children(
    presentationRels
      .replace(/^[\s\S]*?<Relationships\b[^>]*>/, "")
      .replace(/<\/Relationships>[\s\S]*$/, ""),
  );
  const targetFor = (id: string) => {
    const rel = relationships.find((rel) =>
      new RegExp(`\\bId="${id}"`).test(rel),
    );
    const target = rel?.match(/\bTarget="([^"]+)"/)?.[1];
    if (!target) throw new Error("INVALID_POWERPOINT");
    return target.startsWith("/") ? target.slice(1) : `ppt/${target}`;
  };
  const coverPath = targetFor(slideIds[0]);
  const stylePath = targetFor(slideIds[Math.min(3, slideIds.length - 1)]);
  const relPath = (path: string) =>
    path.replace(/\/([^/]+)$/, "/_rels/$1.rels");
  const cleanRels = (value: string) =>
    value.replace(
      /<Relationship\b[^>]*Type="[^"]*\/notesSlide"[^>]*\/?\s*>/g,
      "",
    );
  const style = read(stylePath);
  const styleRels = cleanRels(read(relPath(stylePath)));
  const tree = style.match(/<p:spTree>([\s\S]*?)<\/p:spTree>/)?.[1];
  if (!tree) throw new Error("INVALID_POWERPOINT");
  const shapeParts = children(tree);
  const chromeParts = shapeParts.filter((part) => {
    if (/^<p:(nvGrpSpPr|grpSpPr)\b/.test(part)) return true;
    if (part.startsWith("<p:sp") && !part.includes("<a:t>")) return true;
    if (!part.startsWith("<p:pic")) return false;
    const pos = part.match(/<a:off\b[^>]*y="(\d+)"/);
    const size = part.match(/<a:ext\b[^>]*cx="(\d+)"[^>]*cy="(\d+)"/);
    return Boolean(
      pos &&
      size &&
      Number(pos[1]) < height * 0.18 &&
      Number(size[1]) < width * 0.4 &&
      Number(size[2]) < height * 0.18,
    );
  });
  const chrome = chromeParts.join("");
  const plainChrome = chromeParts
    .filter((part) => {
      const pos = part.match(/<a:off\b[^>]*y="(\d+)"/);
      const size = part.match(/<a:ext\b[^>]*cx="(\d+)"[^>]*cy="(\d+)"/);
      return !(
        pos &&
        size &&
        Number(pos[1]) > height * 0.12 &&
        Number(pos[1]) < height * 0.3 &&
        Number(size[1]) > width * 0.45 &&
        Number(size[2]) > height * 0.02 &&
        Number(size[2]) < height * 0.15
      );
    })
    .join("");
  const theme = files["ppt/theme/theme1.xml"]
    ? read("ppt/theme/theme1.xml")
    : "";
  const font =
    theme.match(
      /<a:minorFont>[\s\S]*?<a:latin\b[^>]*typeface="([^"]+)"/,
    )?.[1] || "Arial";
  const headingShape = shapeParts.find((part) => {
    const pos = part.match(/<a:off\b[^>]*x="(\d+)"[^>]*y="(\d+)"/);
    return (
      part.includes("<a:t>") &&
      pos &&
      Number(pos[1]) < width * 0.26 &&
      Number(pos[2]) > height * 0.25
    );
  });
  const headingColor = headingShape?.match(
    /<a:srgbClr\b[^>]*val="([0-9A-Fa-f]{6})"/,
  )?.[1];
  const accent =
    (headingColor ??
      theme.match(
        /<a:accent1>\s*<a:srgbClr\b[^>]*val="([0-9A-Fa-f]{6})"/,
      )?.[1]) ||
    "004B3A";
  let shapeId = 1000;
  const box = (
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    size = 16,
    color = "34454B",
    bold = false,
  ) =>
    `<p:sp><p:nvSpPr><p:cNvPr id="${shapeId++}" name="Report text"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${Math.round(x * width)}" y="${Math.round(y * height)}"/><a:ext cx="${Math.round(w * width)}" cy="${Math.round(h * height)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="0" rIns="0" tIns="0" bIns="0"><a:normAutofit/></a:bodyPr><a:lstStyle/>${text
      .split("\n")
      .map(
        (line) =>
          `<a:p><a:pPr><a:spcAft><a:spcPts val="500"/></a:spcAft></a:pPr><a:r><a:rPr lang="${locale}" sz="${size * 100}"${bold ? ' b="1"' : ""}><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="${xml(font)}"/></a:rPr><a:t xml:space="preserve">${xml(line)}</a:t></a:r></a:p>`,
      )
      .join("")}</p:txBody></p:sp>`;
  const t = locale === "it" ? reportsIT : reportsEN;
  const workbook = reportWorkbook(data, period, locale, createdAt);
  const learnings = reportLearnings(data, period, locale);
  const pageRels: string[] = [];
  const slideNames: string[] = [];
  let contentTypes = read("[Content_Types].xml");
  // Unreferenced original chart slides and notes must not remain as hidden report pages.
  for (const name of Object.keys(files))
    if (name.startsWith("ppt/slides/") || name.startsWith("ppt/notesSlides/"))
      delete files[name];
  contentTypes = contentTypes.replace(
    /<Override\b[^>]*PartName="\/ppt\/(?:slides|notesSlides)\/[^>]*\/?\s*>/g,
    "",
  );
  const addType = (path: string, type: string) => {
    contentTypes = contentTypes.replace(
      "</Types>",
      `<Override PartName="/${path}" ContentType="${type}"/></Types>`,
    );
  };
  const addSlide = (
    body: string,
    rels = styleRels,
    cover = false,
    withBanner = false,
  ) => {
    const number = slideNames.length + 1;
    const name = `ppt/slides/reportSlide${number}.xml`;
    slideNames.push(name);
    const footer =
      box(
        0.04,
        0.943,
        0.8,
        0.025,
        `${t.draft} · ${period.start} – ${period.end} · Google · v${data.snapshot.version}`,
        8,
      ) + box(0.93, 0.943, 0.04, 0.025, String(number), 8);
    files[name] = strToU8(
      cover
        ? body.replace(
            "</p:spTree>",
            `${box(0.04, 0.92, 0.65, 0.045, `${t.draft} · ${period.start} – ${period.end} · v${data.snapshot.version}`, 10, "003D30", true).replace("<a:noFill/>", '<a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>')}</p:spTree>`,
          )
        : `<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="${drawing}" xmlns:r="${office}"><p:cSld>${style.match(/<p:bg\b[\s\S]*?<\/p:bg>/)?.[0] ?? ""}<p:spTree>${withBanner ? chrome : plainChrome}${body}${footer}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`,
    );
    files[relPath(name)] = strToU8(rels);
    pageRels.push(
      `<Relationship Id="reportSlide${number}" Type="${office}/slide" Target="slides/reportSlide${number}.xml"/>`,
    );
    addType(
      name,
      "application/vnd.openxmlformats-officedocument.presentationml.slide+xml",
    );
  };
  // The cover is copied before deleting the old package parts.
  const original = unzipSync(source, {
    filter: (file) =>
      file.name === coverPath || file.name === relPath(coverPath),
  });
  addSlide(
    strFromU8(original[coverPath]),
    cleanRels(strFromU8(original[relPath(coverPath)])),
    true,
  );
  const indexTitles = [
    t.keyLearnings,
    ...workbook.sheets.map((sheet) => sheet.title),
    t.sharedVisitorsTitle,
    t.sources,
  ];
  addSlide(
    box(0.04, 0.35, 0.2, 0.22, t.contents, 30, accent) +
      box(
        0.28,
        0.23,
        0.65,
        0.62,
        indexTitles.map((title, i) => `${i + 1}. ${title}`).join("\n"),
        17,
      ),
  );
  const split = Math.ceil(learnings.bullets.length / 2);
  addSlide(
    box(0.04, 0.35, 0.2, 0.22, t.keyLearnings, 30, accent) +
      box(
        0.28,
        0.25,
        0.31,
        0.4,
        learnings.bullets
          .slice(0, split)
          .map((text) => `• ${text}`)
          .join("\n\n"),
        15,
      ) +
      box(
        0.64,
        0.25,
        0.31,
        0.4,
        learnings.bullets
          .slice(split)
          .map((text) => `• ${text}`)
          .join("\n\n"),
        15,
      ) +
      box(
        0.28,
        0.71,
        0.67,
        0.17,
        `${t.actions}\n${learnings.actions.join("\n")}`,
        13,
      ),
  );
  let chartNumber = 0;
  const chartSlide = (sheet: ReviewExcelSheet, subtitle: string) => {
    const number = ++chartNumber;
    const details = unzipSync(
      buildReviewExcel({ locale, sheets: [sheet], includeCharts: true }),
    );
    let chart = strFromU8(details["xl/charts/chart1.xml"]);
    chart = chart
      .replace(/<c:title>[\s\S]*?<\/c:title>/, "")
      .replace(
        '<c:autoTitleDeleted val="0"/>',
        '<c:autoTitleDeleted val="1"/>',
      );
    chart = chart
      .replace(
        '<c:gapWidth val="100"/>',
        `<c:dLbls><c:numFmt formatCode="${sheet.format}" sourceLinked="0"/><c:dLblPos val="outEnd"/><c:showLegendKey val="0"/><c:showVal val="1"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/></c:dLbls><c:gapWidth val="100"/>`,
      )
      .replace("<c:chartSpace ", `<c:chartSpace xmlns:r="${office}" `)
      .replace(
        "</c:chartSpace>",
        '<c:externalData r:id="reportWorkbook"><c:autoUpdate val="0"/></c:externalData></c:chartSpace>',
      );
    const chartPath = `ppt/charts/reportChart${number}.xml`;
    const bookPath = `ppt/embeddings/reportData${number}.xlsx`;
    files[chartPath] = strToU8(chart);
    files[bookPath] = buildReviewExcel({
      locale,
      sheets: [sheet],
      includeCharts: false,
    });
    files[relPath(chartPath)] = strToU8(
      `<Relationships xmlns="${relNs}"><Relationship Id="reportWorkbook" Type="${office}/package" Target="../embeddings/reportData${number}.xlsx"/></Relationships>`,
    );
    addType(
      chartPath,
      "application/vnd.openxmlformats-officedocument.drawingml.chart+xml",
    );
    addType(
      bookPath,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    const graphic = `<p:graphicFrame><p:nvGraphicFramePr><p:cNvPr id="${shapeId++}" name="${xml(sheet.title)}"/><p:cNvGraphicFramePr/><p:nvPr/></p:nvGraphicFramePr><p:xfrm><a:off x="${Math.round(width * 0.27)}" y="${Math.round(height * 0.28)}"/><a:ext cx="${Math.round(width * 0.69)}" cy="${Math.round(height * 0.57)}"/></p:xfrm><a:graphic><a:graphicData uri="${chartNs}"><c:chart xmlns:c="${chartNs}" r:id="reportChart"/></a:graphicData></a:graphic></p:graphicFrame>`;
    const noData =
      sheet.rows.length < 2 ||
      !sheet.rows
        .slice(1)
        .some((row) => row.slice(1).some((value) => typeof value === "number"));
    const body =
      box(0.04, 0.36, 0.2, 0.25, sheet.title, 27, accent) +
      box(0.27, 0.195, 0.69, 0.055, subtitle, 17, accent, true) +
      (noData
        ? box(0.3, 0.38, 0.61, 0.23, sheet.notes[2] ?? t.unavailable, 19)
        : graphic) +
      box(0.27, 0.86, 0.69, 0.055, `${t.embeddedData} · ${sheet.notes[0]}`, 8);
    addSlide(
      body,
      styleRels.replace(
        "</Relationships>",
        `<Relationship Id="reportChart" Type="${office}/chart" Target="../charts/reportChart${number}.xml"/></Relationships>`,
      ),
      false,
      true,
    );
  };
  for (const sheet of workbook.sheets) chartSlide(sheet, sheet.title);
  const selected = new Set(
    data.exportOptions?.listingIds ??
      data.coverage.map((place) => place.listingId),
  );
  const primary = data.coverage.find(
    (place) => place.role === "primary" && selected.has(place.listingId),
  );
  const shared = data.sharedL12M;
  const sharedRows =
    shared?.available && primary
      ? shared.rows.filter((row) => selected.has(row.listingId))
      : [];
  const sharedSheet: ReviewExcelSheet = {
    name: "shared visitors",
    title: t.sharedVisitorsTitle,
    format: "0.0%",
    maximum: 1,
    rows: [
      [
        t.sharedDirection,
        ...sharedRows.map(
          (row) =>
            data.coverage.find((place) => place.listingId === row.listingId)
              ?.label ?? row.listingId,
        ),
      ],
      [
        t.primaryShare,
        ...sharedRows.map((row) =>
          row.primaryShare === null ? null : row.primaryShare / 100,
        ),
      ],
      [
        t.competitorShare,
        ...sharedRows.map((row) =>
          row.competitorShare === null ? null : row.competitorShare / 100,
        ),
      ],
    ],
    samples: [
      [
        t.sharedDirection,
        ...sharedRows.map(
          (row) =>
            data.coverage.find((place) => place.listingId === row.listingId)
              ?.label ?? row.listingId,
        ),
      ],
      [t.primaryReviewers, ...sharedRows.map((row) => row.primaryReviewers)],
      [
        t.competitorReviewers,
        ...sharedRows.map((row) => row.competitorReviewers),
      ],
      [t.sharedReviewers, ...sharedRows.map((row) => row.shared)],
    ],
    notes: [
      `Google · L12M · ${shared?.start ?? data.metrics.rollingStart} – ${shared?.end ?? data.metrics.rollingEnd}`,
      t.sharedVisitorsMethod,
      t.unavailable,
    ],
  };
  chartSlide(sharedSheet, t.sharedVisitorsSubtitle);
  addSlide(
    box(0.04, 0.35, 0.2, 0.22, t.sources, 28, accent) +
      box(
        0.28,
        0.23,
        0.66,
        0.62,
        [
          t.methodology,
          t.sharedVisitorsMethod,
          t.historyNotice,
          t.draftHint,
          `Dataset: ${data.snapshot.id} · v${data.snapshot.version} · ${data.snapshot.createdAt}`,
        ].join("\n\n"),
        14,
      ),
  );
  files["ppt/presentation.xml"] = strToU8(
    presentation.replace(
      /<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/,
      `<p:sldIdLst>${slideNames.map((_, i) => `<p:sldId id="${1000 + i}" r:id="reportSlide${i + 1}"/>`).join("")}</p:sldIdLst>`,
    ),
  );
  files["ppt/_rels/presentation.xml.rels"] = strToU8(
    `<Relationships xmlns="${relNs}">${relationships.filter((rel) => !rel.includes(`${office}/slide"`)).join("")}${pageRels.join("")}</Relationships>`,
  );
  files["[Content_Types].xml"] = strToU8(contentTypes);
  return zipSync(files, { level: 6 });
}
