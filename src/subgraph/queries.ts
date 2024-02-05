import { gql } from "@apollo/client"

export const GET_ALL_DATA = gql`
  {
    validators {
      id
      clusterId
      rollup
      status
    }
    nodeOperators {
      id
      ip
      name
      pubkey
    }
    clusters {
      id
      operatorIds
      ssvFeePaid
    }
    rollups {
      bridgeContract
      executionRewards
      id
      name
      nexusFeePercentage
      slashing
      stakingLimit
      validatorCount
      clusterId
    }
  }
`

export const GET_ALL_VALIDATORS = gql`
  {
    validators {
      clusterId
      id
      rollup
      status
    }
  }
`

export const GET_ALL_NODE_OPERATORS = gql`
  {
    nodeOperators {
      id
      ip
      name
      pubkey
    }
  }
`

export const GET_ALL_CLUSTERS = gql`
  {
    clusters {
      id
      operatorIds
      ssvFeePaid
    }
  }
`

export const GET_ALL_ROLLUPS = gql`
  {
    rollups {
      bridgeContract
      clusterId
      executionRewards
      id
      name
      nexusFeePercentage
      slashing
      stakingLimit
      validatorCount
    }
  }
`
