# DSFE F Pros Part A — SBA clinical editorial audit

Date: 17 November 2026. Independent educational editorial audit; no participating external prosthodontists or official examiners, no psychometric validation.

## Scope and inventory
- Full source package: latest self-contained 1,500-item Books I/II/III bank, with 165-page notebook, historical answers and glossary kept intact.
- All 1,500 records passed structural review for unique IDs, five nonduplicate options, one proposed valid option-letter key and nonempty explanation. This does **not** establish correctness of each clinical choice.
- Source version has 452 unique answer-option families across 1,500 items; closely related transfer variants can inflate timed scores.
- Original exactly repeated stems: 73 redundant occurrences. After editorial reconstruction: 0 redundant occurrences.
- 37 independently authored, source-anchored cases replaced weak legacy items with new scenarios, options, proposed keys, explanations and reference links.
- 74 redundant clinical scenarios reconstructed from contrasting clinical findings preserved in the original explanation, with keys and explanations amended. Their proposed keys remain unverified.
- 95 additional stems had nonclinical boilerplate removed without altering their clinical choice.
- 221 additional formulaic second-opinion scenarios were converted into direct clinical cases with unchanged proposed answers (not clinically revalidated).
- Total distinct question IDs with substantive new or reconstructed cases: 111.

## Editorial status totals
- Previously edited draft: 83
- Legacy: clinical key and distractors unverified: 1306
- Editorial contrast-case draft: 74
- Editorial source-anchored draft: 37

## Changes to the study interface
- Retains one self-contained index.html (no assets folder), the 165-page original notebook, historical answer book and glossary.
- Adds **one item per answer-option family** selection, ON by default; this reduces question-family repetition within a mock.
- Excludes flag-labelled generic templates by default; the user may still choose to see the full 1,500 educational draft bank.
- Shows editorial status and family identifiers alongside each question.
- Uses new version-specific progress keys, protecting earlier scores from silently being marked against changed keys.
- Exam formats remain 90 questions/120 minutes and two papers of 90 for 180 total.

## Clinical high-stakes source anchors
- DSFE syllabus and official samples: https://dsfe.org.uk/prosthodontics/
- Original RDITN complexity assessment: https://www.rcseng.ac.uk/-/media/Files/RCS/FDS/Publications/complexityassessment.pdf
- NHS restorative dentistry clinical standard: https://www.england.nhs.uk/wp-content/uploads/2022/10/B1640-clinical-standard-restorative-dentistry.pdf
- SDCEP anticoagulants: https://companion.sdcep.org.uk/management-of-dental-patients-taking-anticoagulants-or-antiplatelet-drugs/treatment-recommendations/direct-oral-anticoagulants-doacs/higher-risk-of-bleeding-complications/
- IADT trauma guidelines: https://iadt-dentaltrauma.org/guidelines-and-resources/guidelines/
- EFP peri-implantitis guideline: https://onlinelibrary.wiley.com/doi/10.1111/jcpe.13823
- UK Environment Agency waste classification: https://www.gov.uk/guidance/healthcare-and-related-wastes-how-to-classify

## Outstanding non-negotiable work
1. Independent specialists need to adjudicate all 1,500 proposed keys and distractors, with evidence/version/date and disagreements logged. The 37 new cases and reconstructed ones are draft editorial exercises only.
2. Validate all new questions against exact 80 ES curriculum outcome wording, not merely numerical tags.
3. Add real licensed or ethically obtained clinical images; there are no new validated photographic/radiographic cases in this update.
4. Pilot-test unseen questions against candidate data for difficulty/discrimination. The present bank must not be used to estimate probability of passing.
5. Test offline persistence and Safari in a real deployed environment.
6. Continue to replace legacy weak cases rather than relabeling them as verified.

## File guidance
- `index.html` — overwrite repository-root index.html (one file only).
- `FPros_1500_Clinical_QA_Bank.json` — editable structured question data for further review.
- `FPros_1500_Item_Clinical_QA_Inventory.csv` — every item, its family, review state, flags and current proposed key.
- `FPros_Substantive_Change_Log.csv` — original/revised key and ES for each changed item.
- `README_AUDIT.md` — this report.
