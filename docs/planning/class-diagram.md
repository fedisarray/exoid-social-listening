# Logical class diagram

Status: proposed domain model, not a final SQL schema. It separates source observations, immutable analysis snapshots, derived metrics, and report versions so an old export can be reproduced. The [source specification](../../Retail_Review_Analytics_Internal_Specification%20%281%29.docx) controls behavior if the implementation model changes.

```mermaid
classDiagram
direction LR

class Analyst {
  +uuid id
  +string email
}
class Analysis {
  +uuid id
  +string name
  +uuid ownerId
}
class AnalysisVersion {
  +uuid id
  +int versionNumber
  +string periodType
  +date startDate
  +date endDate
  +date reportCutoff
  +datetime savedAt
}
class AnalysisListingRole {
  +uuid id
  +string role
  +string displayLabel
  +int displayOrder
}
class Listing {
  +uuid id
  +string source
  +string sourceListingId
  +string name
  +string address
  +string country
  +string sourceUrl
  +string timezone
}
class CollectionRun {
  +uuid id
  +string provider
  +string providerVersion
  +string status
  +datetime startedAt
  +datetime finishedAt
}
class ListingCoverage {
  +uuid id
  +date requestedStart
  +date requestedEnd
  +date observedStart
  +date observedEnd
  +int recordsReturned
  +int missingReviewIds
  +int missingReviewerIds
  +string limitation
}
class Review {
  +uuid id
  +string source
  +string sourceReviewId
  +uuid listingId
}
class ReviewRevision {
  +uuid id
  +datetime publishedAt
  +int rating
  +string originalText
  +string originalLanguage
  +string reviewerId
  +string reviewUrl
  +datetime observedAt
}
class DatasetSnapshot {
  +uuid id
  +datetime frozenAt
  +string coverageStatus
}
class SnapshotReview {
  +uuid snapshotId
  +uuid reviewRevisionId
}
class MetricResultSet {
  +uuid id
  +string definitionVersion
  +datetime calculatedAt
}
class ReviewAnnotation {
  +uuid id
  +string modelVersion
  +string themes
  +string sentiment
}
class CommentaryVersion {
  +uuid id
  +string status
  +datetime reviewedAt
}
class Finding {
  +uuid id
  +string kind
  +string text
  +string origin
  +string reviewStatus
}
class EvidenceLink {
  +uuid id
  +string evidenceType
  +uuid targetId
}
class ReportVersion {
  +uuid id
  +string templateVersion
  +string status
  +datetime createdAt
}
class ExportRun {
  +uuid id
  +string generatorVersion
  +string status
  +string filePath
}

Analyst "1" --> "0..*" Analysis : owns
Analysis "1" --> "1..*" AnalysisVersion : versions
AnalysisVersion "1" --> "1..*" AnalysisListingRole : assigns
AnalysisListingRole "*" --> "1" Listing : identifies
AnalysisVersion "1" --> "0..*" CollectionRun : requests
CollectionRun "1" --> "1..*" ListingCoverage : diagnoses
ListingCoverage "*" --> "1" Listing : measures
Listing "1" --> "0..*" Review : hosts
Review "1" --> "1..*" ReviewRevision : observations
CollectionRun "1" --> "0..*" ReviewRevision : observes
AnalysisVersion "1" --> "0..*" DatasetSnapshot : freezes
DatasetSnapshot "1" --> "0..*" SnapshotReview : includes
SnapshotReview "*" --> "1" ReviewRevision : pins
DatasetSnapshot "1" --> "0..*" MetricResultSet : calculates
ReviewRevision "1" --> "0..*" ReviewAnnotation : classifiedBy
AnalysisVersion "1" --> "0..*" CommentaryVersion : drafts
CommentaryVersion "1" --> "0..*" Finding : contains
Finding "1" --> "0..*" EvidenceLink : cites
ReportVersion "*" --> "1" AnalysisVersion : uses
ReportVersion "*" --> "1" DatasetSnapshot : uses
ReportVersion "*" --> "1" MetricResultSet : uses
ReportVersion "*" --> "1" CommentaryVersion : uses
ReportVersion "1" --> "0..*" ExportRun : generates
```

## Invariants and modelling notes

- Each `AnalysisVersion` has exactly one `primary` role. It may have any number of `additionalOwn`, `competitor`, and `anchor` roles. Role constraints and duplicate listing handling require explicit database checks.
- `Listing` identity is source plus source listing ID. `Review` identity is source plus stable review ID, with a listing consistency check. Missing IDs require a validated source-specific fallback before ingestion.
- `ReviewRevision` preserves observed source changes. `DatasetSnapshot` explicitly pins revision IDs through `SnapshotReview` and records coverage, so newer observations cannot rewrite old calculations.
- `MetricResultSet` is deterministic and tied to a definition version. An evidence link resolves to a metric result or pinned review revision; a polymorphic link is shown conceptually and needs referentially safe implementation.
- `ReviewAnnotation` is derived, versioned, and may be absent. It does not replace original review text or star ratings.
- `ReportVersion` is immutable and binds configuration, dataset, metrics, commentary, and template. `ExportRun` records each attempted PPTX generation.
- Authorized access may later require an explicit `AnalysisAccess` class if accounts extend beyond single owners; access requirements must still be enforced now.
- Opaque reviewer IDs are scoped by source. Cross-source person matching by names, avatars, or language is outside the model.
