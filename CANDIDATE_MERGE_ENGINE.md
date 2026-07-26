# Candidate Merge Engine Documentation

This document describes the deduplication and candidate merging strategy used by the DSPG Plagiarism Engine.

## 1. Pipeline Overview
Once parallel queries resolve, candidate lists are merged, deduplicated, and prepared for similarity scoring:
1. **Fetch**: Retrieve papers from CORE and OpenAlex.
2. **Merge**: Process lists sequentially, starting with CORE (authoritative document retrieval).
3. **Deduplicate**: Filter duplicate papers based on a strict 4-step hierarchy.
4. **Scoring**: Route unique papers to the Similarity Engine.

## 2. Deduplication Hierarchy
1. **Digital Object Identifier (DOI)**: Clean DOIs (lowercase, strip URLs) are compared. If they match, the work is marked as duplicate.
2. **Unified ID**: Matches OpenAlex ID and CORE IDs to ensure no duplicates from the same source survive.
3. **Normalized Title**: Titles are normalized by lowercasing and stripping all non-alphanumeric characters. 
4. **Author Overlap**: If titles match exactly, papers are marked as duplicates only if there is a overlap of at least one author name.

## 3. Metrics Tracking
For every analysis request, the merge engine logs:
- `retrieved`: Number of raw candidate works returned by the provider.
- `accepted` (used): Works successfully merged into the evaluation pool.
- `rejected` (duplicate): Works identified as duplicates.
- `duplicate`: Duplicates count.
