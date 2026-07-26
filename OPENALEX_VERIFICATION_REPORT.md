# OpenAlex Verification Report

This report documents the verification details of the OpenAlex API for incorporation into the DSPG Research Federation.

## 1. API Endpoints
- **Base URL**: `https://api.openalex.org`
- **Works Endpoint**: `https://api.openalex.org/works`

## 2. Authentication
- No API Key is strictly required for the free tier.
- A user can optionally append `mailto=your-email@example.com` to enter the polite pool, unlocking higher rate limits and reliability.

## 3. Rate Limits
- **Polite Pool**: Up to 10 requests per second (RPS) and 100,000 requests per day.
- **Anonymous Pool**: Lower priority, rate limits vary.

## 4. Query Syntax & Filtering
- **Keyword Search**: `https://api.openalex.org/works?search=query_string`
- **Filter by Title**: `https://api.openalex.org/works?filter=title.search:query_string`
- **Filter by DOI**: `https://api.openalex.org/works?filter=doi:https://doi.org/10.1000/xyz123`

## 5. Response Payload Schema
OpenAlex returns a JSON object with:
- `meta`: Contains request metadata (`count`, `db_response_time_ms`, `page`, `per_page`).
- `results`: List of works. Each work contains:
  - `id`: Unique OpenAlex URI (e.g., `https://openalex.org/W2741809807`)
  - `doi`: Digital Object Identifier URI (e.g., `https://doi.org/10.1016/...`)
  - `title`: Work title (string)
  - `publication_year`: Year of publication (number)
  - `authorships`: Array containing author details (`authorships[].author.display_name`)
  - `concepts`: Array of tags representing subject matters (`concepts[].display_name`)
  - `cited_by_count`: Citation count (number)
  - `primary_location`: Location of the landing page/PDF (`primary_location.landing_page_url`)

## 6. Error & Timeout Handling
- OpenAlex returns standard HTTP status codes:
  - `400 Bad Request`: Invalid filter parameters.
  - `429 Too Many Requests`: Rate limit exceeded.
- Transient errors should be handled with a timeout (default 5s) and retries.
