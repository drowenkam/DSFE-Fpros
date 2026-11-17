# DSFE F Pros — All 1,500 pool default fix (17 November 2026)

Issue reproduced on the previous site: 397 questions in the selected pool with two restrictive default filters.

QA triage set to all but option-family dedup retained: 489.
Both filters off: 1,500 (500 each across Books I, II and III).

Correction: both filters now default to ALL; new "Show all 1,500 questions" reset button checks all book/domain/type boxes, resets QA and case-independence filters and resets the question-history selector.

The "397" subset remains accessible through optional filters. These are 1,500 question IDs, not 1,500 independently validated clinical decisions. No question/answer payload, notebook, historical materials or embedded guidelines has been altered in this patch. Existing study progress storage keys unchanged.

To install: replace only the root index.html on the existing DSFE-Fpros GitHub Pages repository. Do not upload ZIP itself as a single item. Browser may need hard refresh after deployment.
