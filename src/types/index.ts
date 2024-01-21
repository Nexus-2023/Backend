export interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

export interface Validator {
  public_key: string
  validator_index: number
  cluster_id: string
  balance: number
  status: string
  score: number
  rollupname: string
}

export interface Block {
  block_number: number
  block_proposer: number
  slot: string
  validator_exit: string
  withdrawals: string
  proposer_slashings: string
  finalized: string
}

export interface nodeOperator {
  public_key: string
  name: string
  validator_count: number
  score: number
  node_operator_id: number
  cluster_id: number
}

export interface nodeOperatorSubgraph {
  pubKey: string
  name: string
  id: number
}

export interface nodeOperatorData {
  nodeOperator: nodeOperatorSubgraph[]
}

export interface subgraphValidator {
  clusterId: string
  id: string
  rollup: string
  status: string
}

export interface ValidatorData {
  validators: subgraphValidator[]
}

export interface validatorSubgraphResult {
  data: ValidatorData
}

export interface ValidatorsResponse {
  data: Validator[]
}
