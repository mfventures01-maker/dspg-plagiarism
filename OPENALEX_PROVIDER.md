# OpenAlex Provider Implementation Documentation

This document describes the design and code implementation of the OpenAlex Provider component in the DSPG Glass Box Plagiarism Engine.

## 1. Component Structure
The OpenAlex provider integration resides in three main modules:
1. **Interface definition**: `OpenAlexWork` interface models the fields returned by OpenAlex API.
2. **Provider Wrapper**: `OpenAlexProvider` implements `ResearchProvider`, coordinating queries, formatting, and deterministic ID mapping.
3. **HTTP Client**: `OpenAlexService` handles requests, timeouts (3.5s limit), and retry loops with exponential backoff.

## 2. Deterministic Identifier Mapping
To maintain compatibility with downstream analysis components (such as `SimilarityEngine`) that expect numeric `coreId`s, `OpenAlexProvider` generates deterministic positive integers:
- For standard OpenAlex IDs matching `/W(\d+)/`, it parses the digits into a base-10 number.
- For other IDs, it computes a standard cyclic redundancy string hash code.

## 3. Resilience and Rate-Limits
The `OpenAlexService` targets the **Polite Pool** by appending the polite mailto parameter (`mailto=dspg-plagiarism@example.com`).
It handles retry logic for HTTP 429 (Rate Limit) and transient network disconnects, backed by exponential delays.
- Maximum requests per query: 5 results.
- Signal Abort Timeout: 3.5 seconds.
