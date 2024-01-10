import { gql } from "@apollo/client"

const GET_ALL_DATA = gql`
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

const GET_ALL_VALIDATORS = gql`
  {
    validators {
      clusterId
      id
      rollup
      status
    }
  }
`

const GET_ALL_NODE_OPERATORS = gql`
  {
    nodeOperators {
      id
      ip
      name
      pubkey
    }
  }
`

const GET_ALL_CLUSTERS = gql`
  {
    clusters {
      id
      operatorIds
      ssvFeePaid
    }
  }
`

const GET_ALL_ROLLUPS = gql`
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

export {
  GET_ALL_DATA,
  GET_ALL_ROLLUPS,
  GET_ALL_CLUSTERS,
  GET_ALL_VALIDATORS,
  GET_ALL_NODE_OPERATORS,
}
