## Overview

This is a Node.js Backend repository to interact with the nexus Database and perform monitoring and alerting

## achitecture

![image](https://github.com/Nexus-2023/Backend/assets/42178214/089c7067-f687-4675-a8b0-cfbcae20abb3)

## Getting Started

```
fill up the env file with the database variables
npm install
npm run dev
```

```
open http://localhost:3030/?pretty in the browser
```

## Documentation

## Cron Jobs (src/cronJob.ts)

### Job 1: Fetch and Update Validators

- **File**: `src/cronJob.ts`
- **Function**: `job1`
- **Schedule**: Every 30 minutes
- **Purpose**: Fetches the latest validator data from the Subgraph, hashes the data, and compares it with the previous hash. If changes are detected, calls `POST_VALIDATORS` to update the database.

### Job 2: Update Validators

- **File**: `src/cronJob.ts`
- **Function**: `job2`
- **Schedule**: Every 30 minutes
- **Purpose**: Calls `FETCH_AND_UPDATE_VALIDATORS` to ensure regular updates of validator information from the external API.

### Job 3: Fetch and Insert Block

- **File**: `src/cronJob.ts`
- **Function**: `job3`
- **Schedule**: Every 12 seconds
- **Purpose**: Fetches block data and inserts it into the database if the proposer is one of our validators.

### Job 4: Fetch and insert Node Operators

- **File**: `src/cronJob.ts`
- **Function**: `job4`
- **Schedule**: Every 30 minutes
- **Purpose**: Fetches the latest node operator data from the Subgraph, hashes the data, and compares it with the previous hash. If changes are detected, calls `POST_NODEOPERATORS` to update the database.

### Job 5: Telegram Bot Alerts

- **File**: `src/cronJob.ts`
- **Function**: `job5` (Telegram Bot)
- **Schedule**: Every 30 minutes
- **Purpose**: Sends alerts to a Telegram chat if a validator is slashed or has a balance less than 32 ETH.

## Utils (src/utils)

### Constants (src/utils/constants.ts)

- **File**: `src/utils/constants.ts`
- **Purpose**: Contains constant values used throughout the application.

### Utility Functions (src/utils/index.ts)

- **File**: `src/utils/index.ts`
- **Functions**:
  - `hashData()`: Hashes data using SHA-256.
  - `arraysEqual()`: Compares two arrays for equality.
  - `calculateScore()`: To be implemented later.

## Types (src/types)

- **Folder**: `src/types`
- **Purpose**: Contains TypeScript types used across the application.

## Subgraph (src/subgraph)

### Queries (src/subgraph/queries.ts)

- **File**: `src/subgraph/queries.ts`
- **Purpose**: Contains GraphQL queries for fetching data from the Subgraph.

### Fetch (src/subgraph/fetch.ts)

- **File**: `src/subgraph/fetch.ts`
- **Purpose**: Provides functions to fetch the latest validator and node operator data from the Subgraph.

## Database (src/database)

### Connection (src/database/connection.ts)

- **File**: `src/database/connection.ts`
- **Purpose**: Manages the PostgreSQL database connection pool and provides functions to get and release a database client.

### Query (src/database/query.ts)

- **File**: `src/database/query.ts`
- **Purpose**: Defines SQL queries to interact with the PostgreSQL database. Contains insert , update , select queries

### Setup (src/database/setup.ts)

- **File**: `src/database/setup.ts`
- **Purpose**: Orchestrates the setup of the entire database infrastructure, including creating the database, schema, and tables (Validators, Blocks, NodeOperators).

### Insert_Update (src/database/insert_update.ts)

- **File**: `src/database/insert_update.ts`
- **Purpose**: Contains functions for inserting and updating data in the database.

## Connectors (src/connectors)

### Consensus Connector (src/connectors/consensus_connector.ts)

- **File**: `src/connectors/consensus_connector.ts`
- **Purpose**: Provides a function `consensusDataApi(apiUrl: string)` to fetch data from an external API using the provided URL. Handles error cases and returns the API result.

### Subgraph Connector (src/connectors/subgraph_connector.ts)

- **File**: `src/connectors/subgraph_connector.ts`
- **Purpose**: Utilizes Apollo Client to connect to the Subgraph GraphQL API. Configures the Apollo Client with the Subgraph endpoint from the environment variables.
